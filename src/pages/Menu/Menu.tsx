import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Utensils, Edit2, Trash2, Save } from 'lucide-react';
import type { RootState, AppDispatch } from '../../store';
import {
  fetchMenu,
  addMenu,
  editMenu,
  deleteMenu,
  type FoodItem,
} from '../../store/menuSlice';
import { fetchCategories, addCategory } from '../../store/categorySlice';
import CommonHeader from '../../components/common/CommonHeader';
import CommonOffcanvas from '../../components/common/CommonOffcanvas';
import { confirmAlert, triggerToast } from '../../components/common/CommonAlert';
import AddMenu from './addMenu';
import { getApiErrorMessage } from '../../utils/apiError';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrency } from '@/lib/utils';

const FALLBACK_CATEGORIES = ['Starters', 'Main', 'Beverages', 'Desserts', 'Sides', 'Specials'];

const Menu: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: menu, loading } = useSelector((state: RootState) => state.menu);
  const { categories } = useSelector((state: RootState) => state.categories);

  const [searchTerm, setSearchTerm] = useState('');
  const [isOffcanvasOpen, setIsOffcanvasOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [saving, setSaving] = useState(false);

  const categoryNames = useMemo(() => {
    const names = categories.map((c) => c.name).filter(Boolean);
    return names.length ? names : FALLBACK_CATEGORIES;
  }, [categories]);

  useEffect(() => {
    void dispatch(fetchMenu());
    void dispatch(fetchCategories());
  }, [dispatch]);

  const handleOpenOffcanvas = (item?: FoodItem) => {
    setEditingItem(item || null);
    setIsOffcanvasOpen(true);
  };

  const saveMenuItem = async (data: Record<string, unknown>) => {
    setSaving(true);
    const payload = {
      name: data.name,
      price: data.price,
      category: data.category,
      categories: data.categories,
      description: data.description ?? '',
      image: data.image ?? '',
      status: data.status !== false,
      rate: data.rate,
      code: data.code ?? '',
    };
    try {
      if (editingItem) {
        await dispatch(editMenu({ id: editingItem.id, payload })).unwrap();
        triggerToast('Menu updated', 'success', 'The dish was saved successfully.');
      } else {
        await dispatch(addMenu(payload)).unwrap();
        triggerToast('Menu item added', 'success', 'The new dish was added to the menu.');
      }
      setIsOffcanvasOpen(false);
    } catch (e: unknown) {
      triggerToast('Save failed', 'error', getApiErrorMessage(e, 'Failed to save menu item'));
    }
    setSaving(false);
  };

  const deleteMenuItem = async (id: number) => {
    const confirmation = await confirmAlert(
      'Delete Menu Item?',
      'Are you sure you want to remove this dish from the menu?'
    );
    if (!confirmation.isConfirmed) return;
    try {
      await dispatch(deleteMenu(id)).unwrap();
      triggerToast('Menu item deleted', 'success', 'The dish was removed from the menu.');
    } catch (e: unknown) {
      triggerToast('Delete failed', 'error', getApiErrorMessage(e, 'Failed to delete menu item'));
    }
  };

  const q = searchTerm.toLowerCase();
  const filteredMenu = menu.filter((item) => {
    const catBlob = (item.category || '').toLowerCase();
    const codeStr = String(item.code ?? '').toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      catBlob.includes(q) ||
      codeStr.includes(q)
    );
  });

  const handleQuickAddCategory = async (name: string) => {
    try {
      await dispatch(addCategory({ name: name.trim(), description: '' })).unwrap();
      await dispatch(fetchCategories());
      triggerToast('Category added', 'success', 'Select it above if needed.');
    } catch (e: unknown) {
      triggerToast('Could not add category', 'error', getApiErrorMessage(e, 'Try another name'));
      throw e;
    }
  };

  return (
    <div className="space-y-4">
      <CommonHeader
        title="Menu"
        icon={Utensils}
        searchPlaceholder="Search dishes, code, category…"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        onAddClick={() => handleOpenOffcanvas()}
        addButtonLabel="Add item"
      />

      {loading ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-sm text-muted-foreground">
          Loading menu…
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredMenu.map((item) => (
            <Card
              key={item.id}
              className={cn(
                'overflow-hidden transition-shadow hover:shadow-[var(--shadow-elevated)]',
                !item.status && 'opacity-70'
              )}
            >
              {item.image ? (
                <img src={item.image} alt={item.name} className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 w-full items-center justify-center bg-muted/60 text-muted-foreground">
                  <Utensils className="h-10 w-10" />
                </div>
              )}
              <CardContent className="space-y-3 p-4">
                <div className="flex flex-wrap gap-1.5">
                  {(item.category || '')
                    .split(',')
                    .map((c) => c.trim())
                    .filter(Boolean)
                    .map((cat) => (
                      <Badge key={cat} variant="secondary" className="font-normal">
                        {cat}
                      </Badge>
                    ))}
                  {!item.status && <Badge variant="outline">Inactive</Badge>}
                </div>
                {item.code ? (
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Code {item.code}
                  </p>
                ) : null}
                <h3 className="text-base font-semibold leading-snug">{item.name}</h3>
                {item.description ? (
                  <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                ) : null}
                <div className="flex items-end justify-between gap-2 pt-1">
                  <p className="text-lg font-bold text-primary">
                    {formatCurrency(Number(item.price) || 0)}
                  </p>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8"
                      title="Edit"
                      onClick={() => handleOpenOffcanvas(item)}
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 text-danger hover:text-danger"
                      title="Delete"
                      onClick={() => void deleteMenuItem(item.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredMenu.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border bg-card py-16 text-center">
              <p className="text-sm text-muted-foreground">No menu items found.</p>
              <Button className="mt-4" onClick={() => handleOpenOffcanvas()}>
                Add your first dish
              </Button>
            </div>
          )}
        </div>
      )}

      <CommonOffcanvas
        isOpen={isOffcanvasOpen}
        onClose={() => setIsOffcanvasOpen(false)}
        title={editingItem ? 'Edit Menu Item' : 'Add New Item'}
        width="480px"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOffcanvasOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" form="menu-form" disabled={saving}>
              <Save className="h-4 w-4" />
              {saving ? 'Saving…' : editingItem ? 'Save updates' : 'Publish dish'}
            </Button>
          </>
        }
      >
        <AddMenu
          key={editingItem ? `edit-${editingItem.id}` : `add-${categoryNames[0] ?? 'x'}`}
          initialData={editingItem}
          categoryNames={categoryNames}
          onQuickAddCategory={handleQuickAddCategory}
          onSave={(data) => {
            void saveMenuItem(data);
          }}
        />
      </CommonOffcanvas>
    </div>
  );
};

export default Menu;
