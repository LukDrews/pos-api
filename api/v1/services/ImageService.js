const fs = require("fs/promises");
const { ImagePool } = require("@squoosh/lib");
const path = require("path");

const FILE_EXTENSION = ".jpg"

module.exports = class ImageService {
  constructor(debug) {
    this.logger = debug.extend("images");
  }

  async saveAsJPEG(buffer) {
    if (!buffer) {
      return null;
    }

    const filename = Math.floor(Date.now() / 1000)

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

      await fs.writeFile(this.getUploadPath(filename), encodedImage.binary);
      return this.getImagePath(filename);
    } catch (error) {
      this.logger(error);
      throw error;
    } finally {
      imagePool.close();
    }
  }

  getUploadPath(filename) {
    return path.format({
      dir: "./uploads", // TODO get upload path from config
      name: filename,
      ext: FILE_EXTENSION
    })
  }

  getImagePath(filename) {
    return path.format({
      dir: "/static", // TODO get base path from config
      name: filename,
      ext: FILE_EXTENSION
    })
  }

  async deleteImage(imagePath) {
    const ref = path.parse(imagePath).name;
    await fs.rm(this.getUploadPath(ref));
  }
};
