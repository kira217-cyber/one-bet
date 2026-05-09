import express from "express";
import AffSupportContent from "../models/AffSupportContent.js";
import upload from "../config/multer.js";

const router = express.Router();

const getSingleDoc = async () => {
  let doc = await AffSupportContent.findOne();

  if (!doc) {
    doc = await AffSupportContent.create({
      title: {
        bn: "আমরা আপনার জন্য আছি।",
        en: "We are here for you.",
      },

      subtitle: {
        bn: "",
        en: "",
      },

      openText: {
        bn: "",
        en: "",
      },

      liveChatText: {
        bn: "লাইভ চ্যাট",
        en: "Live Chat",
      },

      noteText: {
        bn: "",
        en: "",
      },

      messageButtonText: {
        bn: "এখন মেসেজ করুন",
        en: "Message us Now",
      },

      channels: [],
    });
  }

  return doc;
};

const normalizePath = (filePath = "") => {
  return filePath.replace(/\\/g, "/");
};





/*
|--------------------------------------------------------------------------
| PUBLIC GET
|--------------------------------------------------------------------------
*/

router.get("/", async (req, res) => {
  try {
    const doc = await getSingleDoc();

    const activeChannels = (doc.channels || [])
      .filter((item) => item.isActive !== false)
      .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

    return res.json({
      success: true,
      data: {
        ...doc.toObject(),
        channels: activeChannels,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load support content",
    });
  }
});





/*
|--------------------------------------------------------------------------
| ADMIN GET
|--------------------------------------------------------------------------
*/

router.get("/admin", async (req, res) => {
  try {
    const doc = await getSingleDoc();

    return res.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to load admin support content",
    });
  }
});





/*
|--------------------------------------------------------------------------
| UPDATE SECTION
|--------------------------------------------------------------------------
*/

router.put(
  "/admin",
  upload.single("backgroundImage"),
  async (req, res) => {
    try {
      const doc = await getSingleDoc();

      const {
        titleBn,
        titleEn,

        subtitleBn,
        subtitleEn,

        openTextBn,
        openTextEn,

        liveChatTextBn,
        liveChatTextEn,

        noteTextBn,
        noteTextEn,

        messageButtonTextBn,
        messageButtonTextEn,

        backgroundImageUrl,

        removeBackgroundImage,

        isActive,
      } = req.body;

      doc.title = {
        bn: titleBn || "",
        en: titleEn || "",
      };

      doc.subtitle = {
        bn: subtitleBn || "",
        en: subtitleEn || "",
      };

      doc.openText = {
        bn: openTextBn || "",
        en: openTextEn || "",
      };

      doc.liveChatText = {
        bn: liveChatTextBn || "",
        en: liveChatTextEn || "",
      };

      doc.noteText = {
        bn: noteTextBn || "",
        en: noteTextEn || "",
      };

      doc.messageButtonText = {
        bn: messageButtonTextBn || "",
        en: messageButtonTextEn || "",
      };

      doc.isActive = String(isActive) === "true";

      if (String(removeBackgroundImage) === "true") {
        doc.backgroundImage = "";
      }

      if (backgroundImageUrl?.trim()) {
        doc.backgroundImage = backgroundImageUrl.trim();
      }

      if (req.file) {
        doc.backgroundImage = normalizePath(
          `/${req.file.path}`,
        );
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Support section updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update support section",
      });
    }
  },
);





/*
|--------------------------------------------------------------------------
| CREATE CHANNEL
|--------------------------------------------------------------------------
*/

router.post(
  "/admin/channels",
  upload.single("icon"),
  async (req, res) => {
    try {
      const doc = await getSingleDoc();

      const {
        name,

        labelBn,
        labelEn,

        link,

        iconUrl,

        order,

        isActive,
      } = req.body;

      let finalIcon = "";

      if (iconUrl?.trim()) {
        finalIcon = iconUrl.trim();
      }

      if (req.file) {
        finalIcon = normalizePath(`/${req.file.path}`);
      }

      doc.channels.push({
        name: name || "",

        label: {
          bn: labelBn || "",
          en: labelEn || "",
        },

        link: link || "",

        icon: finalIcon,

        order: Number(order || 0),

        isActive: String(isActive) === "true",
      });

      await doc.save();

      return res.json({
        success: true,
        message: "Channel created successfully",
        data: doc,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to create channel",
      });
    }
  },
);





/*
|--------------------------------------------------------------------------
| UPDATE CHANNEL
|--------------------------------------------------------------------------
*/

router.put(
  "/admin/channels/:id",
  upload.single("icon"),
  async (req, res) => {
    try {
      const doc = await getSingleDoc();

      const channel = doc.channels.id(req.params.id);

      if (!channel) {
        return res.status(404).json({
          success: false,
          message: "Channel not found",
        });
      }

      const {
        name,

        labelBn,
        labelEn,

        link,

        iconUrl,

        order,

        isActive,

        removeIcon,
      } = req.body;

      channel.name = name || "";

      channel.label = {
        bn: labelBn || "",
        en: labelEn || "",
      };

      channel.link = link || "";

      channel.order = Number(order || 0);

      channel.isActive = String(isActive) === "true";

      if (String(removeIcon) === "true") {
        channel.icon = "";
      }

      if (iconUrl?.trim()) {
        channel.icon = iconUrl.trim();
      }

      if (req.file) {
        channel.icon = normalizePath(`/${req.file.path}`);
      }

      await doc.save();

      return res.json({
        success: true,
        message: "Channel updated successfully",
        data: doc,
      });
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        success: false,
        message: "Failed to update channel",
      });
    }
  },
);





/*
|--------------------------------------------------------------------------
| DELETE CHANNEL
|--------------------------------------------------------------------------
*/

router.delete("/admin/channels/:id", async (req, res) => {
  try {
    const doc = await getSingleDoc();

    doc.channels = doc.channels.filter(
      (item) => item._id.toString() !== req.params.id,
    );

    await doc.save();

    return res.json({
      success: true,
      message: "Channel deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete channel",
    });
  }
});

export default router;