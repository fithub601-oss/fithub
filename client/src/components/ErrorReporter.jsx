import React, { useEffect, useState } from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorReporter = () => {
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const onError = (e) => {
      if (e && e.message) setMessage(e.message);
    };
    const onRejection = (e) => {
      const reason = e && e.reason;
      const text = reason && (reason.message || reason.toString());
      if (text) setMessage(String(text).slice(0, 300));
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);

  if (!message) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 z-[200] flex justify-center">
      <div className="max-w-xl w-full bg-red-600 text-white text-sm font-medium rounded-2xl px-4 py-3 shadow-2xl flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <FaExclamationTriangle className="mt-0.5 shrink-0" />
          <p className="break-words">Something went wrong on this screen: {message}</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="shrink-0 px-3 py-1 bg-white text-red-600 font-bold rounded-full hover:bg-red-50"
        >
          Reload
        </button>
      </div>
    </div>
  );
};

export default ErrorReporter;