import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { SystemActivityData } from "@/types/dashboard";
import { ActivityIcon } from "lucide-react";
import { formatDateRelative } from "@/lib/date-utils";

interface SystemActivityProps {
  activities: SystemActivityData[];
}

const SystemActivity = ({ activities }: SystemActivityProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      activity.type?.includes("ADD")
                        ? "bg-success/10 text-success"
                        : activity.type?.includes("UPDATE")
                          ? "bg-primary/10 text-primary"
                          : activity.type?.includes("USER")
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {/* {activity.type.includes("ITEM") ? (
                        <Package className="w-5 h-5" />
                      ) : activity.type.includes("UPDATE") ? (
                        <Wallet className="w-5 h-5" />
                      ) : activity.type.includes("USER") ? (
                        <Users className="w-5 h-5" />
                      ) : ( */}
                    {activity.type && <ActivityIcon className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.description}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDateRelative(activity.createdAt)}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center flex-col gap-2 h-full">
                <ActivityIcon className="size-8 text-muted-foreground" />
                <p className="text-center w-full  text-muted-foreground">
                  Belum ada aktivitas
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SystemActivity;
