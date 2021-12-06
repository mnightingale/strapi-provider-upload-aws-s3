'use strict';

/**
 * Module dependencies
 */

// Public node modules.
const AWS = require('aws-sdk');

module.exports = {
  init(providerOptions) {
    const { prefix = '', url = '', ...config } = providerOptions;

    const S3 = new AWS.S3({
      apiVersion: '2006-03-01',
      ...config,
    });

    return {
      upload(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // upload file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          const key = `${prefix}${path}${file.hash}${file.ext}`;
          S3.upload(
            {
              Key: key,
              Body: Buffer.from(file.buffer, 'binary'),
              ACL: 'public-read',
              ContentType: file.mime,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              // set the bucket file url
              if (url) {
                file.url = `${url}/${key}`;
              } else {
                file.url = data.Location;
              }

              resolve();
            }
          );
        });
      },
      delete(file, customParams = {}) {
        return new Promise((resolve, reject) => {
          // delete file on S3 bucket
          const path = file.path ? `${file.path}/` : '';
          const key = `${prefix}${path}${file.hash}${file.ext}`;
          S3.deleteObject(
            {
              Key: key,
              ...customParams,
            },
            (err, data) => {
              if (err) {
                return reject(err);
              }

              resolve();
            }
          );
        });
      },
    };
  },
};
