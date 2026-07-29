"use client";

import { ShippingFields } from "@/components/products/shared/ShippingFields";
import { useStore } from "@/lib/store";

export function VariantShippingTab() {
  const variant = useStore((state) => state.draft.variant);
  const setVariantDimension = useStore((state) => state.setVariantDimension);
  const setVariantShipmentType = useStore((state) => state.setVariantShipmentType);

  return (
    <ShippingFields
      dimensions={variant}
      shipmentTypeId={variant.shipmentTypeId}
      onChangeDimension={setVariantDimension}
      onChangeShipmentType={setVariantShipmentType}
    />
  );
}
