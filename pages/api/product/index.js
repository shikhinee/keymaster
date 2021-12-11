import product from "@/models/products";
import dbConnect from "@/utils/database";
import { promises as fs } from "fs";
import formidable from "formidable";

dbConnect();

const requestModHandler = async (req, res) => {
  const { method } = req;

  switch (method) {
    case "GET":
      try {
        const data = await product.find({});
        res.status(200).json({ success: true, data: data });
      } catch (error) {
        console.log(error);
        res.status(400).json({ success: false });
      }
      break;

    case "POST":
      try {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        const formParsePhotoSuccess = await new Promise((resolve, reject) => {
          form.parse(req, async (err, fields, files) => {
            if (err) {
              reject(err);
              return;
            }

            const photoUpload = await Object.values(files).map((file) => {
              const dateNow = new Date();
              return {
                oldpath: file.filepath,
                link: `/assets/images/products/${dateNow.getTime()}-${
                  file.originalFilename
                }`,
                newpath: `./public/assets/images/products/${dateNow.getTime()}-${
                  file.originalFilename
                }`,
              };
            });

            const photoLinks = await photoUpload.map((photo) => {
              return photo.link;
            });

            const productInfo = {
              ...fields,
              photoUpload: photoUpload,
              photoLinks: photoLinks,
            };

            resolve(productInfo);
          });
        }).then(async (productInfo) => {
          let isSuccess = false;

          await productInfo.photoUpload.map(async (file) => {
            await fs.rename(file.oldpath, file.newpath, (err) => {
              if (err) {
                console.log(err);
                return;
              }
            });
          });

          console.log(productInfo.photoLinks);

          await product.create(
            {
              productName: productInfo.productName,
              color: productInfo.color,
              hexColor: productInfo.hexColor,
              type: productInfo.type,
              photoLinks: productInfo.photoLinks,
              productPrice: productInfo.productPrice,
            },
            (err) => {
              if (err) {
                console.log(err);
                return;
              }

              isSuccess = true;
            }
          );
        });

        if (formParsePhotoSuccess) {
          return res
            .status(200)
            .json({ success: true, msg: "Successfully added a new product" });
        } else {
          return res
            .status(200)
            .json({ success: false, msg: "Error adding product" });
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default requestModHandler;
