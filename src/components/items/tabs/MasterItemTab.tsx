import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Item } from "@/features/items/types";
import MasterItemForm from "./MasterItemForm";
import MasterItemTable from "./MasterItemTable";

const MasterItemTab = () => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  return (
    <TabsContent value="data-bahan" className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <MasterItemForm
          selectedItem={selectedItem}
          onChangeSelection={setSelectedItem}
        />
        <MasterItemTable
          selectedItemId={selectedItem?.id}
          onSelectItem={setSelectedItem}
        />
      </div>
    </TabsContent>
  );
};

export default MasterItemTab;
