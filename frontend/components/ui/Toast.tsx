'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000
}) => {
  const [show, setShow] = useState(isVisible);

  useEffect(() => {
    setShow(isVisible);
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false);
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: CheckCircle,
          bgColor: 'bg-success text-success-foreground',
          textColor: 'text-success-foreground',
          borderColor: 'border-success'
        };
      case 'error':
        return {
          icon: XCircle,
          bgColor: 'bg-destructive text-destructive-foreground',
          textColor: 'text-destructive-foreground',
          borderColor: 'border-destructive'
        };
      case 'warning':
        return {
          icon: AlertCircle,
          bgColor: 'bg-warning text-warning-foreground',
          textColor: 'text-warning-foreground',
          borderColor: 'border-warning'
        };
      case 'info':
        return {
          icon: Info,
          bgColor: 'bg-primary text-primary-foreground',
          textColor: 'text-primary-foreground',
          borderColor: 'border-primary'
        };
      default:
        return {
          icon: Info,
          bgColor: 'bg-primary text-primary-foreground',
          textColor: 'text-primary-foreground',
          borderColor: 'border-primary'
        };
    }
  };

  const { icon: Icon, bgColor, borderColor } = getTypeConfig();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg border ${borderColor} ${bgColor}`}
        >
          <div className="flex items-start">
            <Icon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <span className="flex-1">{message}</span>
            <button
              onClick={() => {
                setShow(false);
                setTimeout(onClose, 300);
              }}
              className="ml-2 text-current hover:opacity-80 focus:outline-none"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
