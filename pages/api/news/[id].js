import news from '@/models/news';
import dbConnect from '@/utils/database';
import { getSession } from 'next-auth/react';
// 
import cloudinary from 'cloudinary';
// const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: "keymaster123",
  api_key: "357121876529977",
  api_secret: "iFHdaY3pUNhl3Di1m-gS2KlrOVk"
});




dbConnect();

const requestModHandler = async (req, res) => {
  const {
    method,
    query: { id },
  } = req;
  const session = await getSession({ req });
  const singleNews = await news.findOne({ _id: id });

  switch (method) {
    case 'GET':
      try {
        res.status(200).json({ success: true, data: singleNews });
      } catch (error) {
        console.log(error);
        res.status(400).json({ success: false });
      }
      break;

    case 'POST':
      try {
        if (session.user.isAdmin) {
          const { photoLink, title, description, photoID } = req.body;

          console.log(title);
          console.log(description);
          console.log(photoID);
          console.log(photoLink);

          // get previous photo link
          const currentNews = await news.findOne({ _id: id });

          if (photoLink && photoID) {
            await cloudinary.uploader.destroy(currentNews.photoID);
          }

          const myNews = {
            photoLink,
            title,
            description,
            photoID,
            date: new Date(),
          };

          await news.updateOne({ _id: id }, myNews);
          res.status(200).json({ success: true, msg: 'Medeeg amjilttai soliloo' });
        } else {
          res.status(401).json({ succes: false, msg: 'You dont have access' });
        }
      } catch (error) {
        console.log(error);
        res.status(400).json({ success: false });
      }
      break;

    case 'DELETE':
      try {
        if (session.user.isAdmin) {

          await cloudinary.uploader.destroy(singleNews.photoID);
          await news.deleteOne({ _id: id });
          res.status(200).json({ success: true, msg: 'Successfully deleted' });
        } else {
          return res.status(401).json({ success: false, msg: 'You dont have a access' });
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

export default requestModHandler;
