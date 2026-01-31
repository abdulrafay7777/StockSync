import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import toast from 'react-hot-toast';
import { FaCloudUploadAlt, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const PaymentUpload = ({ setFile, expectedAmount }) => {
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [isValid, setIsValid] = useState(false);

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      toast.error('Images only (JPG/PNG)!');
      return;
    }

    // RESET EVERYTHING ON NEW UPLOAD
    setPreview(URL.createObjectURL(selectedFile));
    setScanning(true);
    setIsValid(false);
    setFile(null); // <--- CRITICAL: Clears any previous valid file immediately

    try {
      const result = await Tesseract.recognize(
        selectedFile,
        'eng', 
        { 
            // Force CDN for browser compatibility
            workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@v5.0.0/dist/worker.min.js',
            langPath: 'https://tessdata.projectnaptha.com/4.0.0', 
            corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@v5.0.0/tesseract-core.wasm.js'
        }
      );

      const text = result.data.text.toLowerCase().replace(/[^a-z0-9\s.]/g, '');
      console.log("Scanned:", text);

      const keywords = ['success', 'transaction', 'id', 'rs', 'pkr', 'sent', 'transfer', 'paid', 'completed'];
      const hasKeyword = keywords.some(word => text.includes(word));
      
      const amountString = expectedAmount.toString();
      const hasAmount = text.includes(amountString) || text.includes(amountString + ".00");

      if (hasKeyword && hasAmount) {
        setIsValid(true);
        setFile(selectedFile); // <--- ONLY set file if valid
        toast.success(`Verified! Amount matched: ${expectedAmount}`);
      } else {
        setIsValid(false);
        setFile(null); // <--- CRITICAL: Ensure file remains null if rejected
        
        if (!hasKeyword) toast.error("Rejected: Not a valid receipt.");
        else if (!hasAmount) toast.error("Not a valid receipt");
      }

    } catch (err) {
      console.error(err);
      toast.error("Scan failed. Please retry.");
      setIsValid(false);
      setFile(null);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="mt-4">
      {/* (Keep your existing JSX for the UI labels) */}
      <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition relative overflow-hidden ${isValid ? 'border-green-400 bg-green-50' : 'border-blue-300 bg-blue-50'}`}>
        
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-40" />
            <div className="z-10 flex flex-col items-center">
              {scanning ? (
                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow">
                  <FaSpinner className="animate-spin text-blue-600" />
                  <span className="text-sm font-bold text-blue-800">Verifying...</span>
                </div>
              ) : isValid ? (
                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full shadow border border-green-200">
                  <FaCheckCircle className="text-green-600" />
                  <span className="text-sm font-bold text-green-800">Verified</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <div className="flex items-center gap-2 bg-red-100 px-3 py-1 rounded-full shadow border border-red-200">
                    <FaTimesCircle className="text-red-600" />
                    <span className="text-sm font-bold text-red-800">Rejected</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <FaCloudUploadAlt className="w-8 h-8 text-blue-500 mb-2" />
            <p className="text-sm text-gray-500">Upload Payment Screenshot</p>
          </div>
        )}
        
        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
      </label>
    </div>
  );
};

export default PaymentUpload;