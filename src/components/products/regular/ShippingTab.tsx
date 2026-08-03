"use client";

import { ShippingFields } from "@/components/products/shared/ShippingFields";
import { useStore } from "@/lib/store";

export function RegularShippingTab() {
  const simple = useStore((state) => state.draft.simple);
  const setSimpleDimension = useStore((state) => state.setSimpleDimension);
  const setSimpleShipmentType = useStore((state) => state.setSimpleShipmentType);

  return (
    <ShippingFields
      dimensions={simple}
      shipmentTypeId={simple.shipmentTypeId}
      onChangeDimension={setSimpleDimension}
      onChangeShipmentType={setSimpleShipmentType}
    />
  );
}
