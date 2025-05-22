
import React from 'react';
import { useHumanNeededCounter } from '@/hooks/useHumanNeededCounter';
import { cn } from '@/lib/utils';
import { Loader2, Bell, AlertOctagon } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationCounterProps {
  className?: string;
}

const NotificationCounter: React.FC<NotificationCounterProps> = ({ className }) => {
  const { count, loading, error } = useHumanNeededCounter();
  
  return (
    <motion.div 
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      ) : error ? (
        <AlertOctagon className="h-5 w-5 text-destructive" />
      ) : (
        <Bell className={cn(
          "h-5 w-5", 
          count > 0 ? "text-primary" : "text-muted-foreground"
        )} />
      )}
      
      {count > 0 && !loading && !error && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{
            scale: [1, 1.25, 1],
            transition: { duration: 0.5 }
          }}
          className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-medium text-white"
          key={count}
          layoutId="notificationBadge"
        >
          {count}
        </motion.div>
      )}
    </motion.div>
  );
};

export default NotificationCounter;
