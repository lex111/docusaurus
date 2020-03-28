/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const {getOptions} = require('loader-utils');
const {readFile} = require('fs-extra');
const mdx = require('@mdx-js/mdx');
const emoji = require('remark-emoji');
const matter = require('gray-matter');
const stringifyObject = require('stringify-object');
const slug = require('./remark/slug');
const rightToc = require('./remark/rightToc');

const LRU = require('lru-cache');
const hash = require('hash-sum');
const cache = new LRU({max: 1000});

const cache1 = new Map();

const DEFAULT_OPTIONS = {
  rehypePlugins: [],
  remarkPlugins: [emoji, slug, rightToc],
};

console.log('cache', cache);

module.exports = async function(fileString) {
  this.cacheable = true;
  const resourcePath = this.resourcePath;

  const cacheKey = hash({fileString, resourcePath});
  console.log('cache LE', cache.length);
  console.log('cache 1 LE', cache1.size);
  const cached = cache.get(cacheKey);
  const cached1 = cache1.get(cacheKey);

  const callback = this.async();

  // console.log('res', resourcePath, cacheKey);

  if (cached) {
    console.log('FROM CACHE');
    callback(null, cached);
    return;
  }

  if (cached1) {
    console.log('FROM CACHE 1');
    callback(null, cached1);
    return;
  }

  const {data, content} = matter(fileString);
  const reqOptions = getOptions(this) || {};
  const options = {
    ...reqOptions,
    remarkPlugins: [
      ...DEFAULT_OPTIONS.remarkPlugins,
      ...(reqOptions.remarkPlugins || []),
    ],
    rehypePlugins: [
      ...DEFAULT_OPTIONS.rehypePlugins,
      ...(reqOptions.rehypePlugins || []),
    ],
    filepath: this.resourcePath,
  };
  let result;

  try {
    result = await mdx(content, options);
  } catch (err) {
    return callback(err);
  }

  // console.log(result);

  let exportStr = `export const frontMatter = ${stringifyObject(data)};`;

  // Read metadata for this MDX and export it.
  if (options.metadataPath && typeof options.metadataPath === 'function') {
    const metadataPath = options.metadataPath(this.resourcePath);

    if (metadataPath) {
      // Add as dependency of this loader result so that we can
      // recompile if metadata is changed.
      this.addDependency(metadataPath);
      const metadata = await readFile(metadataPath, 'utf8');
      exportStr += `\nexport const metadata = ${metadata};`;
    }
  }

  // console.log(exportStr);

  const code = `
  import React from 'react';
  import { mdx } from '@mdx-js/react';

  ${exportStr}
  ${result}
  `;

  cache.set(cacheKey, code);
  cache1.set(cacheKey, code);

  return callback(null, code);
};
