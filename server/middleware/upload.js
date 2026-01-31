const multer = require('multer');
const path = require('path');

// Storage Engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function(req, file, cb){
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init Upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Limit: 5MB
  fileFilter: function(req, file, cb){
    checkFileType(file, cb);
  }
});

// Check File Type Function
function checkFileType(file, cb){
  // Allowed ext
  const filetypes = /jpeg|jpg|png/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if(mimetype && extname){
    return cb(null, true);
  } else {
    // This creates the specific error message
    cb(new Error('Images Only! (jpeg, jpg, png)'));
  }
}

module.exports = upload;