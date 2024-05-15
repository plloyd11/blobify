const multer = require('multer');
const Jimp = require('jimp');
const upload = multer({ dest: '/tmp/' }).single('image');

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed',
    };
  }

  return new Promise((resolve) => {
    const fakeReq = {
      headers: {
        'content-type': event.headers['content-type'],
      },
      body: Buffer.from(event.body, 'base64'),
    };
    upload(fakeReq, {}, async (err) => {
      if (err) {
        console.error('Upload error:', err);
        return resolve({
          statusCode: 500,
          body: 'Error processing image.',
        });
      }

      try {
        const filePath = fakeReq.file.path;
        const image = await Jimp.read(filePath);
        const width = image.bitmap.width;
        const height = image.bitmap.height;

        console.log(`Processing image: ${filePath}, Width: ${width}, Height: ${height}`);

        const clipPath = new Jimp(width, height, (err, clipPath) => {
          if (err) throw err;
          clipPath.scan(0, 0, width, height, function (x, y, idx) {
            const distance = Math.min(
              x,
              y,
              width - x - 1,
              height - y - 1
            );
            if (distance > 50) {
              clipPath.bitmap.data[idx + 3] = 0;
            }
          });
        });

        image.mask(clipPath, 0, 0);
        const buffer = await image.getBufferAsync(Jimp.MIME_PNG);
        console.log('Image processed successfully');

        resolve({
          statusCode: 200,
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename="clipped-image.png"',
          },
          body: buffer.toString('base64'),
          isBase64Encoded: true,
        });
      } catch (error) {
        console.error('Processing error:', error);
        resolve({
          statusCode: 500,
          body: `Error processing image: ${error.message}`,
        });
      }
    });
  });
};
