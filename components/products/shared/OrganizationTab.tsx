"use client";

import { EntityMultiSelect } from "@/components/products/shared/EntityMultiSelect";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useStore } from "@/lib/store";

const UNSET = "__unset__";

export function OrganizationTab() {
  const organization = useStore((state) => state.draft.organization);
  const productTypes = useStore((state) => state.productTypes);
  const collections = useStore((state) => state.collections);
  const categories = useStore((state) => state.categories);
  const shippingProfiles = useStore((state) => state.shippingProfiles);
  const salesChannels = useStore((state) => state.salesChannels);
  const tags = useStore((state) => state.tags);

  const setDiscountable = useStore((state) => state.setDiscountable);
  const setOrganizationTypeId = useStore((state) => state.setOrganizationTypeId);
  const setOrganizationCollectionId = useStore((state) => state.setOrganizationCollectionId);
  const toggleOrganizationCategory = useStore((state) => state.toggleOrganizationCategory);
  const toggleOrganizationTag = useStore((state) => state.toggleOrganizationTag);
  const setOrganizationShippingProfileId = useStore(
    (state) => state.setOrganizationShippingProfileId
  );
  const toggleSalesChannel = useStore((state) => state.toggleSalesChannel);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">ניתן להנחה</p>
          <p className="text-muted-foreground text-sm">
            כאשר לא מסומן, הנחות לא יחולו על מוצר זה.
          </p>
        </div>
        <Switch checked={organization.discountable} onCheckedChange={setDiscountable} />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label>סוג</Label>
          <Select
            value={organization.typeId ?? UNSET}
            onValueChange={(value) => setOrganizationTypeId(value === UNSET ? null : value)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="בחר סוג" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>ללא</SelectItem>
              {productTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>קולקציה</Label>
          <Select
            value={organization.collectionId ?? UNSET}
            onValueChange={(value) => setOrganizationCollectionId(value === UNSET ? null : value)}
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="בחר קולקציה" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>ללא</SelectItem>
              {collections.map((collection) => (
                <SelectItem key={collection.id} value={collection.id}>
                  {collection.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>קטגוריות</Label>
          <EntityMultiSelect
            options={categories}
            selectedIds={organization.categoryIds}
            onToggle={toggleOrganizationCategory}
            placeholder="בחירת קטגוריות"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>תגיות</Label>
          <EntityMultiSelect
            options={tags}
            selectedIds={organization.tagIds}
            onToggle={toggleOrganizationTag}
            placeholder="בחירת תגיות"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>פרופיל משלוח</Label>
          <Select
            value={organization.shippingProfileId ?? UNSET}
            onValueChange={(value) =>
              setOrganizationShippingProfileId(value === UNSET ? null : value)
            }
          >
            <SelectTrigger className="max-w-xs">
              <SelectValue placeholder="בחר פרופיל משלוח" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>ללא</SelectItem>
              {shippingProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  {profile.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label>ערוצי מכירה</Label>
          <EntityMultiSelect
            options={salesChannels}
            selectedIds={organization.salesChannelIds}
            onToggle={toggleSalesChannel}
            placeholder="בחירת ערוצי מכירה"
          />
        </div>
      </div>
    </div>
  );
}
