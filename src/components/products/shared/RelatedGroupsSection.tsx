"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { RelatedGroup } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManageRelatedGroupModal } from "@/components/products/shared/ManageRelatedGroupModal";

export function RelatedGroupsSection() {
  const editingProductId = useStore((state) => state.editingProductId);
  const groups = useStore((state) => state.relatedGroups);
  const status = useStore((state) => state.relatedGroupsStatus);
  const error = useStore((state) => state.relatedGroupsError);
  const loadRelatedGroups = useStore((state) => state.loadRelatedGroups);
  const [managingGroup, setManagingGroup] = useState<RelatedGroup | null>(null);

  useEffect(() => {
    if (editingProductId) loadRelatedGroups(editingProductId);
  }, [editingProductId, loadRelatedGroups]);

  if (!editingProductId) {
    return (
      <p className="text-muted-foreground text-sm">
        יש לשמור את המוצר לפני קישורו לקבוצות מוצרים קשורים.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {status === "loading" && groups.length === 0 && (
        <p className="text-muted-foreground text-sm">טוען...</p>
      )}
      {error && <p className="text-destructive text-sm">{error}</p>}

      {groups.length === 0 && status === "ready" && (
        <p className="text-muted-foreground text-sm">
          לא הוגדרו קבוצות מוצרים קשורים במערכת.
        </p>
      )}

      {groups.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>קבוצה</TableHead>
              <TableHead>תיאור</TableHead>
              <TableHead>מוצרים קשורים</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id}>
                <TableCell className="font-medium">{group.title}</TableCell>
                <TableCell className="text-muted-foreground max-w-72 truncate">
                  {group.description || "—"}
                </TableCell>
                <TableCell>{group.productsCount}</TableCell>
                <TableCell>
                  <Button type="button" variant="outline" size="sm" onClick={() => setManagingGroup(group)}>
                    ניהול
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {managingGroup && (
        <ManageRelatedGroupModal
          productId={editingProductId}
          group={managingGroup}
          open={managingGroup !== null}
          onOpenChange={(open) => {
            if (!open) setManagingGroup(null);
          }}
        />
      )}
    </div>
  );
}
