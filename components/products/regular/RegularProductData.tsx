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
      <TabsList className="w-44 shrink-0 gap-1 border-e bg-transparent p-0 pe-4">
        <TabsTrigger value="general">
          <Wrench />
          כללי
        </TabsTrigger>
        <TabsTrigger value="inventory">
          <Tags />
          מלאי
        </TabsTrigger>
        <TabsTrigger value="organization">
          <Building2 />
          ארגון
        </TabsTrigger>
        <TabsTrigger value="shipping">
          <Truck />
          משלוח
        </TabsTrigger>
        <TabsTrigger value="attributes">
          <LayoutGrid />
          תכונות
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
