import { Card, CardContent } from "./ui/card";

const StatsCard = ({
  title,
  value,
  icon,
  bgIcon,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  bgIcon: string;
}) => (
  <Card className="hover-lift">
    <CardContent className="pt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="text-2xl font-bold">{value}</div>
        </div>
        <div
          className={`w-10 h-10 rounded-lg ${bgIcon} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

export default StatsCard;
