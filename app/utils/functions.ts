import { launchImageLibrary } from "react-native-image-picker";
import { uploadContent } from "../services/calls";

const upload = async (path: any, name?: string) => {
  try {
    const data = new FormData();
    data.append("files", {
      uri: path,
      name: name ? name : "photo1.jpg",
      type: "*/*",
    });
    data.append(
      "title",
      name ? name : `${(Math.random() * 232 * Math.random()).toFixed(0)}`
    );
    data.append(
      "name",
      name ? name : `${(Math.random() * 232 * Math.random()).toFixed(0)}`
    );
    const res = await uploadContent(data);

    if (res?.status == 200 || res?.status == 201) {
      return res?.data?.url[0];
    } else {
    }
  } catch (err) {
    console.log("err", err);
  }
};

const selectAndUploadImages = async (startId: number, item: any) => {
  return new Promise((resolve) => {
    launchImageLibrary(
      { mediaType: "photo", selectionLimit: 0 }, // Allows multiple image selection
      async (response) => {
        if (response.didCancel || response.errorCode) {
          console.log("User cancelled image picker or an error occurred");
          resolve([]);
          return;
        }

        let uploadedImages = [];
        let index = startId;

        for (const asset of response.assets || []) {
          try {
            const path = asset.uri;
            const name = asset.fileName || `photo_${index}.jpg`;

            const url = await upload(path, name);
            if (url) {
              uploadedImages.push({
                ...item,
                id: index++,
                date: new Date().toLocaleString(),
                message: "",
                text: "",
                sender: "",
                isPicture: true,
                path: url,
              });
            }
          } catch (error) {
            console.log("Upload error:", error);
          }
        }

        resolve(uploadedImages);
      }
    );
  });
};

export default selectAndUploadImages;
