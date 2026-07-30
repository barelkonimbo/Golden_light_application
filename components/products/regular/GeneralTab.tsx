"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useStore } from "@/lib/store";

export function RegularGeneralTab() {
  const price = useStore((state) => state.draft.simple.price);
  const channelPrices = useStore((state) => state.draft.simple.channelPrices);
  const selectedChannelIds = useStore((state) => state.draft.organization.salesChannelIds);
  const salesChannels = useStore((state) => state.salesChannels);
  const setSimpleField = useStore((state) => state.setSimpleField);
  const setSimpleChannelPrice = useStore((state) => state.setSimpleChannelPrice);

  const channels = selectedChannelIds
    .map((channelId) => salesChannels.find((channel) => channel.id === channelId))
    .filter((channel): channel is NonNullable<typeof channel> => Boolean(channel));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex max-w-md flex-col gap-2">
        <Label htmlFor="simple-price">מחיר רגיל (₪)</Label>
        <Input
          id="simple-price"
          type="number"
          inputMode="decimal"
          value={price}
          onChange={(event) => setSimpleField("price", event.target.value)}
        />
      </div>

      {channels.length > 0 && (
        <div className="flex flex-col gap-2 border-t pt-4">
          <span className="text-sm font-medium">מחירים לפי ערוץ מכירה</span>
          <p className="text-muted-foreground text-sm">
            ניתן לקבוע מחיר שונה לכל ערוץ מכירה שנבחר בלשונית &quot;ארגון&quot;. ערוץ ללא מחיר יעשה שימוש במחיר הרגיל.
          </p>
          <div className="flex flex-col gap-2">
            {channels.map((channel) => {
              const channelPrice = channelPrices.find((item) => item.channelId === channel.id);
              return (
                <div key={channel.id} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm">{channel.name}</span>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder={price || "מחיר (₪)"}
                    className="max-w-40"
                    value={channelPrice?.price ?? ""}
                    onChange={(event) => setSimpleChannelPrice(channel.id, event.target.value)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
