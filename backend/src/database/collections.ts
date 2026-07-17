import type { Collection, Db } from "mongodb";
import {
  User,
  Product,
  SaleRecord,
  ExpenseRecord,
  ChatMessage
} from "../types";

/**
 * Array-like facade over a MongoDB collection.
 *
 * Existing route handlers were written against a plain `T[]`, so they read:
 *   - `users.find(u => u.id === id)`
 *   - `users.filter(...)`
 *   - `users.some(...)`
 *   - `users.map(...)`, `.reduce(...)`, `.slice(...)`
 *   - `users.findIndex(...)`
 *   - `users.push(item)`
 *   - `users.length`
 *
 * And they assign like `db.users = db.users.filter(...)` or `db.sales = newArr`.
 *
 * Rather than rewrite every handler, this class exposes the same surface and
 * persists mutations transparently. Reads are served from an in-memory cache
 * for speed; writes happen through to MongoDB.
 *
 * Mutation methods are fire-and-forget: they update the cache synchronously
 * and queue the persistence write. The handler can keep its existing shape
 * (e.g. `db.users.push(newUser); writeDb();`) and the data is still saved.
 */
class CollectionStore<T extends { id: string }> {
  private cache: T[] = [];
  private readonly mongoCollection: Collection<T>;
  private readonly name: string;

  constructor(name: string, db: Db) {
    this.name = name;
    this.mongoCollection = db.collection<T>(name);
  }

  /** Load all documents from MongoDB into the in-memory cache. */
  async hydrate(): Promise<void> {
    const docs = await this.mongoCollection.find({}).toArray();
    this.cache = docs as T[];
    console.log(
      `[mongo] ${this.name}: hydrated ${this.cache.length} document(s).`
    );
  }

  /** True if cache has no documents (used to decide whether to seed). */
  isEmpty(): boolean {
    return this.cache.length === 0;
  }

  /** Push a single document; persists asynchronously. */
  push(doc: T): number {
    this.cache.push(doc);
    // Fire-and-forget persistence. Errors are logged but don't break the
    // response path; cache remains the source of truth for the current process.
    this.mongoCollection
      .insertOne(doc as any)
      .catch((err) =>
        console.error(`[mongo] ${this.name}.push insertOne failed:`, err)
      );
    return this.cache.length;
  }

  /** Overwrite the entire collection (used by the seeder). */
  async replaceAll(docs: T[]): Promise<void> {
    await this.mongoCollection.deleteMany({});
    if (docs.length > 0) {
      await this.mongoCollection.insertMany(docs as any);
    }
    this.cache = [...docs];
  }

  /**
   * Replace one document by predicate match. Returns true if something was
   * updated.
   */
  async updateOne(
    predicate: (item: T) => boolean,
    updater: (item: T) => T
  ): Promise<boolean> {
    const idx = this.cache.findIndex(predicate);
    if (idx === -1) return false;
    const updated = updater({ ...this.cache[idx] });
    this.cache[idx] = updated;
    try {
      await this.mongoCollection.replaceOne(
        { id: updated.id } as any,
        updated as any,
        { upsert: true }
      );
    } catch (err) {
      // No rollback; the cache is still updated and a retry of the next write
      // will converge.
      console.error(`[mongo] ${this.name} updateOne failed:`, err);
    }
    return true;
  }

  /**
   * Remove all documents matching predicate. Used to support the existing
   * `db.products = db.products.filter(p => p.id !== id)` pattern.
   */
  async removeWhere(predicate: (item: T) => boolean): Promise<number> {
    const idsToRemove = this.cache
      .filter(predicate)
      .map((x) => x.id);
    if (idsToRemove.length === 0) return 0;
    this.cache = this.cache.filter((x) => !predicate(x));
    try {
      await this.mongoCollection.deleteMany({
        id: { $in: idsToRemove }
      } as any);
    } catch (err) {
      console.error(`[mongo] ${this.name} removeWhere failed:`, err);
    }
    return idsToRemove.length;
  }

  // ---------- Array-like read API (synchronous, served from cache) ----------

  get length(): number {
    return this.cache.length;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.cache.find(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.cache.filter(predicate);
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.cache.findIndex(predicate);
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.cache.some(predicate);
  }

  map<U>(mapper: (item: T) => U): U[] {
    return this.cache.map(mapper);
  }

  forEach(visitor: (item: T, index: number, arr: T[]) => void): void {
    this.cache.forEach(visitor);
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initial: U): U {
    return this.cache.reduce(reducer, initial);
  }

  slice(start?: number, end?: number): T[] {
    return this.cache.slice(start, end);
  }

  /** Return a plain copy of the cache (safe to JSON.stringify). */
  toArray(): T[] {
    return [...this.cache];
  }

  /** Allow spread / for-of to materialize as a plain array of items. */
  [Symbol.iterator](): Iterator<T> {
    return this.cache[Symbol.iterator]();
  }

  /**
   * When Express or any other code calls JSON.stringify on this object,
   * serialize the cache as a plain array. Without this, internal MongoDB
   * references on the collection cause a circular structure error.
   */
  toJSON(): T[] {
    return this.toArray();
  }
}

export interface Collections {
  users: CollectionStore<User> | MemoryCollectionStore<User>;
  products: CollectionStore<Product> | MemoryCollectionStore<Product>;
  sales: CollectionStore<SaleRecord> | MemoryCollectionStore<SaleRecord>;
  expenses: CollectionStore<ExpenseRecord> | MemoryCollectionStore<ExpenseRecord>;
  chats: CollectionStore<ChatMessage> | MemoryCollectionStore<ChatMessage>;
}

class MemoryCollectionStore<T extends { id: string }> {
  private cache: T[] = [];
  private readonly name: string;

  constructor(name: string) {
    this.name = name;
  }

  async hydrate(): Promise<void> {
    this.cache = [];
    console.log(`[mongo] ${this.name}: hydrated 0 document(s).`);
  }

  isEmpty(): boolean {
    return this.cache.length === 0;
  }

  push(doc: T): number {
    this.cache.push(doc);
    return this.cache.length;
  }

  async replaceAll(docs: T[]): Promise<void> {
    this.cache = [...docs];
  }

  async updateOne(predicate: (item: T) => boolean, updater: (item: T) => T): Promise<boolean> {
    const idx = this.cache.findIndex(predicate);
    if (idx === -1) return false;
    this.cache[idx] = updater({ ...this.cache[idx] });
    return true;
  }

  async removeWhere(predicate: (item: T) => boolean): Promise<number> {
    const idsToRemove = this.cache.filter(predicate).map((x) => x.id);
    if (idsToRemove.length === 0) return 0;
    this.cache = this.cache.filter((x) => !predicate(x));
    return idsToRemove.length;
  }

  get length(): number {
    return this.cache.length;
  }

  find(predicate: (item: T) => boolean): T | undefined {
    return this.cache.find(predicate);
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.cache.filter(predicate);
  }

  findIndex(predicate: (item: T) => boolean): number {
    return this.cache.findIndex(predicate);
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.cache.some(predicate);
  }

  map<U>(mapper: (item: T) => U): U[] {
    return this.cache.map(mapper);
  }

  forEach(visitor: (item: T, index: number, arr: T[]) => void): void {
    this.cache.forEach(visitor);
  }

  reduce<U>(reducer: (acc: U, item: T) => U, initial: U): U {
    return this.cache.reduce(reducer, initial);
  }

  slice(start?: number, end?: number): T[] {
    return this.cache.slice(start, end);
  }

  toArray(): T[] {
    return [...this.cache];
  }

  [Symbol.iterator](): Iterator<T> {
    return this.cache[Symbol.iterator]();
  }

  toJSON(): T[] {
    return this.toArray();
  }
}

export function createFallbackCollections(): Collections {
  return {
    users: new MemoryCollectionStore<User>("users"),
    products: new MemoryCollectionStore<Product>("products"),
    sales: new MemoryCollectionStore<SaleRecord>("sales"),
    expenses: new MemoryCollectionStore<ExpenseRecord>("expenses"),
    chats: new MemoryCollectionStore<ChatMessage>("chats")
  };
}

export async function loadCollections(db: Db): Promise<Collections> {
  const c: Collections = {
    users: new CollectionStore<User>("users", db),
    products: new CollectionStore<Product>("products", db),
    sales: new CollectionStore<SaleRecord>("sales", db),
    expenses: new CollectionStore<ExpenseRecord>("expenses", db),
    chats: new CollectionStore<ChatMessage>("chats", db)
  };
  await Promise.all([
    c.users.hydrate(),
    c.products.hydrate(),
    c.sales.hydrate(),
    c.expenses.hydrate(),
    c.chats.hydrate()
  ]);
  return c;
}
