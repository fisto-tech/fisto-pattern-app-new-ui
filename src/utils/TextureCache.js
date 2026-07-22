/**
 * TextureCache — singleton that wraps THREE.TextureLoader with a promise-based
 * cache keyed by URL.  The same texture is never decoded or uploaded to the GPU
 * more than once per session.  The cache stores live THREE.Texture objects so
 * re-use is zero-cost after the first load.
 *
 * Usage:
 *   import { textureCache } from '../utils/TextureCache';
 *   const texture = await textureCache.load(url, { wrapS: THREE.RepeatWrapping });
 *
 * Disposal:
 *   textureCache.dispose(url);   // release one entry
 *   textureCache.clear();        // release all (call on unmount if needed)
 */

import * as THREE from 'three';

class TextureCache {
  constructor() {
    /** @type {Map<string, Promise<THREE.Texture>>} */
    this._pending = new Map();
    /** @type {Map<string, THREE.Texture>} */
    this._cache   = new Map();
    this._loader  = new THREE.TextureLoader();
  }

  /**
   * Load a texture, returning a promise that resolves to a THREE.Texture.
   * Subsequent calls with the same URL return the cached texture instantly.
   *
   * @param {string} url
   * @param {object} [opts]
   * @param {number}  [opts.wrapS]       default: THREE.ClampToEdgeWrapping
   * @param {number}  [opts.wrapT]       default: THREE.ClampToEdgeWrapping
   * @param {boolean} [opts.flipY]       default: false
   * @param {string}  [opts.colorSpace]  default: '' (no override)
   * @returns {Promise<THREE.Texture>}
   */
  load(url, opts = {}) {
    if (!url) return Promise.reject(new Error('TextureCache.load: url is required'));

    // Return cached texture immediately (cloned so callers can mutate independently)
    if (this._cache.has(url)) {
      return Promise.resolve(this._applyOpts(this._cache.get(url).clone(), opts));
    }

    // Return in-flight promise so concurrent requests share one decode
    if (this._pending.has(url)) {
      return this._pending.get(url).then((tex) => this._applyOpts(tex.clone(), opts));
    }

    const promise = new Promise((resolve, reject) => {
      this._loader.load(
        url,
        (texture) => {
          this._cache.set(url, texture);
          this._pending.delete(url);
          resolve(this._applyOpts(texture.clone(), opts));
        },
        undefined,
        (err) => {
          this._pending.delete(url);
          reject(err);
        },
      );
    });

    this._pending.set(url, promise);
    return promise;
  }

  /** @private */
  _applyOpts(texture, opts) {
    if (opts.wrapS !== undefined)    texture.wrapS    = opts.wrapS;
    if (opts.wrapT !== undefined)    texture.wrapT    = opts.wrapT;
    if (opts.flipY !== undefined)    texture.flipY    = opts.flipY;
    if (opts.colorSpace !== undefined) texture.colorSpace = opts.colorSpace;
    if (opts.repeat)                 texture.repeat.copy(opts.repeat);
    return texture;
  }

  /**
   * Dispose and remove one cached entry.
   * @param {string} url
   */
  dispose(url) {
    const tex = this._cache.get(url);
    if (tex) {
      tex.dispose();
      this._cache.delete(url);
    }
  }

  /** Dispose all cached textures and reset the cache. */
  clear() {
    this._cache.forEach((tex) => tex.dispose());
    this._cache.clear();
    this._pending.clear();
  }

  /** Number of currently cached textures (diagnostic). */
  get size() {
    return this._cache.size;
  }
}

// Export a single shared instance for the whole app.
export const textureCache = new TextureCache();
