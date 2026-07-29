"use client";

import { OrganizationTab } from "@/components/products/shared/OrganizationTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VariantAttributesTab } from "./AttributesTab";
import { VariantInventoryTab } from "./InventoryTab";
import { VariantShippingTab } from "./ShippingTab";
import { VariantsTab } from "./VariantsTab";
import { Building2, LayoutGrid, Rows3, Tags, Truck } from "lucide-react";

export function VariantProductData() {
  return (
    <Tabs defaultValue="inventory" orientation="vertical">
      <TabsList className="w-44 shrink-0 gap-1 border-e bg-transparent p-0 pe-4">
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
        <TabsTrigger value="variants">
          <Rows3 />
          וריאציות
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inventory" className="ps-6">
        <VariantInventoryTab />
      </TabsContent>
      <TabsContent value="organization" className="ps-6">
        <OrganizationTab />
      </TabsContent>
      <TabsContent value="shipping" className="ps-6">
        <VariantShippingTab />
      </TabsContent>
      <TabsContent value="attributes" className="ps-6">
        <VariantAttributesTab />
      </TabsContent>
      <TabsContent value="variants" className="ps-6">
        <VariantsTab />
      </TabsContent>
    </Tabs>
  );
}
