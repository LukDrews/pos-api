const fs = require("fs/promises");
const { ImagePool } = require("@squoosh/lib");
const path = require("path");

module.exports = class ImageService {
  constructor(debug) {
    this.logger = debug.extend("images");
  }

  async saveAsJPEG(buffer, filename) {
    if (!buffer || !filename) {
      return null;
    }

    const imagePool = new ImagePool();
    try {
      const image = await imagePool.ingestImage(buffer);
      const preprocessOptions = {
        //When either width or height is specified, the image resized to specified size keeping aspect ratio.
        resize: {
          height: 720,
        },
      };
      await image.preprocess(preprocessOptions);

      const encodeOptions = {
        mozjpeg: {},
      };
      await image.encode(encodeOptions);
      const encodedImage = await image.encodedWith.mozjpeg;

      const ref = `${filename}.${encodedImage.extension}`;
      await fs.writeFile(this.getUploadPath(ref), encodedImage.binary);
      return this.createImageUrl(ref);
    } catch (error) {
      this.logger(error);
      throw error;
    } finally {
      imagePool.close();
    }
  }

  getUploadPath(filename) {
    return path.join("./uploads/", filename); // TODO get upload path from config
  }

  createImageUrl(ref) {
    return `/static/${ref}`; // TODO get base path from config
  }

  async deleteImage(imageUrl) {
    const ref = path.basename(imageUrl);
    await fs.rm(this.getUploadPath(ref));
  }
};
