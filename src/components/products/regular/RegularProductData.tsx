"use client";

import { OrganizationTab } from "@/components/products/shared/OrganizationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegularAttributesTab } from "./AttributesTab";
import { RegularGeneralTab } from "./GeneralTab";
import { RegularInventoryTab } from "./InventoryTab";
import { RegularShippingTab } from "./ShippingTab";
import { Building2, LayoutGrid, Tags, Truck, Wrench } from "lucide-react";

export function RegularProductData() {
  return (
    <Tabs defaultValue="general" orientation="vertical">
      <TabsList className="w-12 shrink-0 gap-1 border-e bg-transparent p-0 pe-2 sm:w-44 sm:pe-4">
        <TabsTrigger value="general" title="כללי">
          <Wrench />
          <span className="hidden sm:inline">כללי</span>
        </TabsTrigger>
        <TabsTrigger value="inventory" title="מלאי">
          <Tags />
          <span className="hidden sm:inline">מלאי</span>
        </TabsTrigger>
        <TabsTrigger value="organization" title="ארגון">
          <Building2 />
          <span className="hidden sm:inline">ארגון</span>
        </TabsTrigger>
        <TabsTrigger value="shipping" title="משלוח">
          <Truck />
          <span className="hidden sm:inline">משלוח</span>
        </TabsTrigger>
        <TabsTrigger value="attributes" title="תכונות">
          <LayoutGrid />
          <span className="hidden sm:inline">תכונות</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="ps-6">
        <RegularGeneralTab />
      </TabsContent>
      <TabsContent value="inventory" className="ps-6">
        <RegularInventoryTab />
      </TabsContent>
      <TabsContent value="organization" className="ps-6">
        <OrganizationTab />
      </TabsContent>
      <TabsContent value="shipping" className="ps-6">
        <RegularShippingTab />
      </TabsContent>
      <TabsContent value="attributes" className="ps-6">
        <RegularAttributesTab />
      </TabsContent>
    </Tabs>
  );
}
