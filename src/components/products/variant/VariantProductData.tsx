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
      <TabsList className="w-12 shrink-0 gap-1 border-e bg-transparent p-0 pe-2 sm:w-44 sm:pe-4">
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
        <TabsTrigger value="variants" title="וריאציות">
          <Rows3 />
          <span className="hidden sm:inline">וריאציות</span>
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
