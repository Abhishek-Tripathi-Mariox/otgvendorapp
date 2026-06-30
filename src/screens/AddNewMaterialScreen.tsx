import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import BottomNavBar from '../components/BottomNavBar';
import KeyboardAwareScrollView from '../components/KeyboardAwareScrollView';
import {useSidebar} from '../components/SidebarProvider';
import NotificationBell from '../components/NotificationBell';
import {launchImageLibrary} from 'react-native-image-picker';
import {uploadVendorImage} from '../services/orders';
import {
  InventoryMenuIcon,
  InventoryBellIcon,
  BackArrowIcon,
  DropdownArrowIcon,
  CloudUploadLargeIcon,
  SaveCheckIcon,
} from '../assets/inventory/icons';
import {
  fetchCategories,
  fetchSubCategories,
  fetchMaterialsForCategory,
  addMyMaterial,
  Category,
  SubCategory,
  MaterialOption,
} from '../services/catalog';

const otgLogo = require('../assets/inventory/source_OTG_Grey.png');

const UNITS = ['Bags', 'Kg', 'Tonnes', 'Pieces', 'Meters', 'Sq.ft', 'Liters'];

interface RouteParams {
  presetCategoryId?: string;
}

const AddNewMaterialScreen: React.FC<{navigation?: any; route?: any}> = ({
  navigation,
  route,
}) => {
  const {openSidebar} = useSidebar();
  const params: RouteParams = route?.params || {};

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);

  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [subCategoriesLoading, setSubCategoriesLoading] = useState(false);
  const [subCategory, setSubCategory] = useState<SubCategory | null>(null);
  const [subCategoryOpen, setSubCategoryOpen] = useState(false);

  const [products, setProducts] = useState<MaterialOption[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [product, setProduct] = useState<MaterialOption | null>(null);
  const [productOpen, setProductOpen] = useState(false);

  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [unitOpen, setUnitOpen] = useState(false);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pick a material image, upload it to S3, and keep the returned URL.
  const pickMaterialImage = async () => {
    if (uploadingImage) return;
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.7,
        maxWidth: 2000,
        maxHeight: 2000,
        selectionLimit: 1,
        includeBase64: true,
      });
      if (res.didCancel) return;
      if (res.errorCode === 'permission') {
        Alert.alert(
          'Permission needed',
          'Enable photo access in Settings to add a material image.',
        );
        return;
      }
      const asset = res.assets?.[0];
      if (!asset?.base64) {
        Alert.alert('Could not read image', 'Please try another photo.');
        return;
      }
      const mime = asset.type || 'image/jpeg';
      const dataUri = `data:${mime};base64,${asset.base64}`;
      setUploadingImage(true);
      const url = await uploadVendorImage(dataUri);
      setImages(prev => [...prev, url]);
    } catch (err: any) {
      Alert.alert(
        'Upload failed',
        err?.response?.data?.message || err?.message || 'Please try again.',
      );
    } finally {
      setUploadingImage(false);
    }
  };

  const closeAll = () => {
    setCategoryOpen(false);
    setSubCategoryOpen(false);
    setProductOpen(false);
    setUnitOpen(false);
  };

  // Load categories
  useEffect(() => {
    let cancelled = false;
    setCategoriesLoading(true);
    fetchCategories()
      .then(data => {
        if (cancelled) return;
        setCategories(data);
        if (params.presetCategoryId) {
          const preset = data.find(c => c._id === params.presetCategoryId);
          if (preset) setCategory(preset);
        }
      })
      .catch(err => console.log('fetchCategories error:', err?.message))
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [params.presetCategoryId]);

  // Load subcategories when category changes
  useEffect(() => {
    if (!category) {
      setSubCategories([]);
      setSubCategory(null);
      return;
    }
    let cancelled = false;
    setSubCategoriesLoading(true);
    setSubCategory(null);
    setProduct(null);
    fetchSubCategories(category._id)
      .then(data => {
        if (!cancelled) setSubCategories(data);
      })
      .catch(err => {
        console.log('fetchSubCategories error:', err?.message);
        if (!cancelled) setSubCategories([]);
      })
      .finally(() => {
        if (!cancelled) setSubCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category]);

  // Load products: depends on subcategory if category has any; otherwise on category
  useEffect(() => {
    if (!category) {
      setProducts([]);
      setProduct(null);
      return;
    }
    const hasSubs = subCategories.length > 0;
    // If category has subcategories, wait until one is picked
    if (hasSubs && !subCategory) {
      setProducts([]);
      setProduct(null);
      return;
    }
    let cancelled = false;
    setProductsLoading(true);
    setProduct(null);
    fetchMaterialsForCategory({
      category: category._id,
      subCategory: subCategory?._id,
      limit: 100,
    })
      .then(data => {
        if (!cancelled) setProducts(data);
      })
      .catch(err => {
        console.log('fetchMaterials error:', err?.message);
        if (!cancelled) setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setProductsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [category, subCategory, subCategories.length]);

  // When a product is selected, prefill unit from master catalog
  useEffect(() => {
    if (product?.unit) setUnit(product.unit);
  }, [product]);

  const hasSubCategories = subCategories.length > 0;

  const validate = (): string | null => {
    if (!category) return 'Please select a category';
    if (hasSubCategories && !subCategory) return 'Please select a sub category';
    if (!product) return 'Please select a product';
    if (!price || isNaN(parseFloat(price))) return 'Please enter a valid price';
    if (!quantity || isNaN(parseInt(quantity, 10)))
      return 'Please enter a valid quantity';
    if (!unit) return 'Please select a unit';
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      Alert.alert('Missing information', err);
      return;
    }
    setSubmitting(true);
    try {
      await addMyMaterial({
        materialId: product!._id,
        price: parseFloat(price),
        quantity: parseInt(quantity, 10),
        specs: unit ? `Unit: ${unit}` : undefined,
        description: description || undefined,
        images: images.length ? images : undefined,
      });
      navigation?.navigate('Dashboard', {
        successMessage:
          'Material added to inventory. Pending admin verification.',
      });
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.message ||
        'Could not save material. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar
        barStyle="light-content"
        backgroundColor="#404040"
        translucent={false}
      />

      {/* Top Bar */}
      <View
        className="flex-row items-center justify-between px-4 bg-primary"
        style={{
          height: 56,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}>
        <View className="flex-row items-center" style={{gap: 12}}>
          <TouchableOpacity
            className="w-8 h-8 items-center justify-center rounded-lg"
            activeOpacity={0.7}
            onPress={openSidebar}>
            <InventoryMenuIcon size={24} color="#fff" />
          </TouchableOpacity>
          <View className="flex-row items-center" style={{gap: 8}}>
            <View
              className="w-8 h-8 rounded-[10px]"
              style={{overflow: 'hidden'}}>
              <Image
                source={otgLogo}
                className="w-8 h-8"
                resizeMode="contain"
              />
            </View>
            <Text
              className="text-[16px] leading-[24px] text-white"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Inventory
            </Text>
          </View>
        </View>
        <NotificationBell Icon={InventoryBellIcon} />
      </View>

      {/* Sub Header */}
      <View
        className="flex-row items-center bg-white px-4"
        style={{
          height: 56,
          gap: 12,
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}>
        <TouchableOpacity
          onPress={() => navigation?.goBack()}
          activeOpacity={0.7}
          className="w-8 h-8 items-center justify-center">
          <BackArrowIcon size={24} color="#404040" />
        </TouchableOpacity>
        <Text
          className="text-[24px] leading-[32px] text-primary"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Add New Material
        </Text>
      </View>

      {/* Content */}
      <KeyboardAwareScrollView
        className="flex-1"
        style={{backgroundColor: '#f9fafb'}}
        contentContainerStyle={{padding: 16, paddingBottom: 140}}
        keyboardShouldPersistTaps="handled">
        {/* Category Dropdown */}
        <Text
          className="text-[14px] leading-[20px] text-primary mb-2"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Category
        </Text>
        <TouchableOpacity
          className="bg-white rounded-lg border border-[#d1d5db] flex-row items-center justify-between px-4 mb-4"
          style={{height: 48}}
          onPress={() => {
            closeAll();
            setCategoryOpen(prev => !prev);
          }}
          activeOpacity={0.7}>
          <Text
            className="text-[14px] leading-[20px]"
            style={{
              fontFamily: 'Poppins-Regular',
              color: category ? '#404040' : '#9ca3af',
            }}>
            {category
              ? category.name
              : categoriesLoading
              ? 'Loading categories...'
              : 'Select category'}
          </Text>
          {categoriesLoading ? (
            <ActivityIndicator size="small" color="#6a7282" />
          ) : (
            <DropdownArrowIcon size={24} color="rgba(0,0,0,0.54)" />
          )}
        </TouchableOpacity>
        {categoryOpen && categories.length > 0 && (
          <View
            className="bg-white rounded-lg border border-[#d1d5db] mb-4"
            style={{
              marginTop: -12,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={cat._id}
                className={`px-4 py-3 ${
                  index < categories.length - 1
                    ? 'border-b border-[#f3f4f6]'
                    : ''
                }`}
                onPress={() => {
                  setCategory(cat);
                  setCategoryOpen(false);
                }}>
                <Text
                  className="text-[14px] leading-[20px] text-primary"
                  style={{fontFamily: 'Poppins-Regular'}}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sub Category Dropdown — only if selected category has subcategories */}
        {category && (subCategoriesLoading || hasSubCategories) && (
          <>
            <Text
              className="text-[14px] leading-[20px] text-primary mb-2"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Sub Category
            </Text>
            <TouchableOpacity
              className="bg-white rounded-lg border border-[#d1d5db] flex-row items-center justify-between px-4 mb-4"
              style={{height: 48}}
              onPress={() => {
                if (subCategoriesLoading) return;
                closeAll();
                setSubCategoryOpen(prev => !prev);
              }}
              activeOpacity={0.7}>
              <Text
                className="text-[14px] leading-[20px]"
                style={{
                  fontFamily: 'Poppins-Regular',
                  color: subCategory ? '#404040' : '#9ca3af',
                }}>
                {subCategory
                  ? subCategory.name
                  : subCategoriesLoading
                  ? 'Loading sub categories...'
                  : 'Select sub category'}
              </Text>
              {subCategoriesLoading ? (
                <ActivityIndicator size="small" color="#6a7282" />
              ) : (
                <DropdownArrowIcon size={24} color="rgba(0,0,0,0.54)" />
              )}
            </TouchableOpacity>
            {subCategoryOpen && hasSubCategories && (
              <View
                className="bg-white rounded-lg border border-[#d1d5db] mb-4"
                style={{
                  marginTop: -12,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                {subCategories.map((sc, index) => (
                  <TouchableOpacity
                    key={sc._id}
                    className={`px-4 py-3 ${
                      index < subCategories.length - 1
                        ? 'border-b border-[#f3f4f6]'
                        : ''
                    }`}
                    onPress={() => {
                      setSubCategory(sc);
                      setSubCategoryOpen(false);
                    }}>
                    <Text
                      className="text-[14px] leading-[20px] text-primary"
                      style={{fontFamily: 'Poppins-Regular'}}>
                      {sc.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {/* Product (Material) Dropdown */}
        {category && (!hasSubCategories || subCategory) && (
          <>
            <Text
              className="text-[14px] leading-[20px] text-primary mb-2"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Product
            </Text>
            <TouchableOpacity
              className="bg-white rounded-lg border border-[#d1d5db] flex-row items-center justify-between px-4 mb-4"
              style={{height: 48}}
              onPress={() => {
                if (productsLoading) return;
                closeAll();
                setProductOpen(prev => !prev);
              }}
              activeOpacity={0.7}>
              <Text
                className="text-[14px] leading-[20px]"
                style={{
                  fontFamily: 'Poppins-Regular',
                  color: product ? '#404040' : '#9ca3af',
                }}
                numberOfLines={1}>
                {product
                  ? product.name
                  : productsLoading
                  ? 'Loading products...'
                  : products.length === 0
                  ? 'No products available'
                  : 'Select product'}
              </Text>
              {productsLoading ? (
                <ActivityIndicator size="small" color="#6a7282" />
              ) : (
                <DropdownArrowIcon size={24} color="rgba(0,0,0,0.54)" />
              )}
            </TouchableOpacity>
            {productOpen && products.length > 0 && (
              <View
                className="bg-white rounded-lg border border-[#d1d5db] mb-4"
                style={{
                  marginTop: -12,
                  maxHeight: 260,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                <ScrollView keyboardShouldPersistTaps="handled">
                  {products.map((p, index) => (
                    <TouchableOpacity
                      key={p._id}
                      className={`px-4 py-3 ${
                        index < products.length - 1
                          ? 'border-b border-[#f3f4f6]'
                          : ''
                      }`}
                      onPress={() => {
                        setProduct(p);
                        setProductOpen(false);
                      }}>
                      <Text
                        className="text-[14px] leading-[20px] text-primary"
                        style={{fontFamily: 'Poppins-Regular'}}>
                        {p.name}
                      </Text>
                      {(p.brand || p.unit) && (
                        <Text
                          className="text-[12px] text-[#6a7282] mt-0.5"
                          style={{fontFamily: 'Poppins-Regular'}}>
                          {[p.brand, p.unit].filter(Boolean).join(' • ')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </>
        )}

        {/* Quantity + Unit Row */}
        <View className="flex-row mb-4" style={{gap: 12}}>
          <View className="flex-1">
            <Text
              className="text-[14px] leading-[20px] text-primary mb-2"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Quantity
            </Text>
            <TextInput
              className="bg-white rounded-lg border border-[#d1d5db] px-4 text-[14px] text-primary"
              style={{height: 48, fontFamily: 'Poppins-Regular'}}
              placeholder="0"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />
          </View>
          <View className="flex-1">
            <Text
              className="text-[14px] leading-[20px] text-primary mb-2"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              Unit
            </Text>
            <TouchableOpacity
              className="bg-white rounded-lg border border-[#d1d5db] flex-row items-center justify-between px-4"
              style={{height: 48}}
              onPress={() => {
                closeAll();
                setUnitOpen(prev => !prev);
              }}
              activeOpacity={0.7}>
              <Text
                className="text-[14px] leading-[20px]"
                style={{
                  fontFamily: 'Poppins-Regular',
                  color: unit ? '#404040' : '#9ca3af',
                }}>
                {unit || 'Select'}
              </Text>
              <DropdownArrowIcon size={24} color="rgba(0,0,0,0.54)" />
            </TouchableOpacity>
            {unitOpen && (
              <View
                className="bg-white rounded-lg border border-[#d1d5db] mt-1"
                style={{
                  position: 'absolute',
                  top: 72,
                  left: 0,
                  right: 0,
                  zIndex: 10,
                  shadowColor: '#000',
                  shadowOffset: {width: 0, height: 2},
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 3,
                }}>
                {UNITS.map((u, index) => (
                  <TouchableOpacity
                    key={u}
                    className={`px-4 py-3 ${
                      index < UNITS.length - 1
                        ? 'border-b border-[#f3f4f6]'
                        : ''
                    }`}
                    onPress={() => {
                      setUnit(u);
                      setUnitOpen(false);
                    }}>
                    <Text
                      className="text-[14px] leading-[20px] text-primary"
                      style={{fontFamily: 'Poppins-Regular'}}>
                      {u}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Price per Unit */}
        <Text
          className="text-[14px] leading-[20px] text-primary mb-2"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Price per Unit
        </Text>
        <View
          className="bg-white rounded-lg border border-[#d1d5db] flex-row items-center mb-4"
          style={{height: 48}}>
          <View
            className="items-center justify-center h-full px-3"
            style={{
              borderRightWidth: 1,
              borderRightColor: '#d1d5db',
            }}>
            <Text
              className="text-[16px] text-primary"
              style={{fontFamily: 'Poppins-SemiBold'}}>
              ₹
            </Text>
          </View>
          <TextInput
            className="flex-1 px-4 text-[14px] text-primary"
            style={{height: 48, fontFamily: 'Poppins-Regular'}}
            placeholder="0.00"
            placeholderTextColor="#9ca3af"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />
        </View>

        {/* Description */}
        <Text
          className="text-[14px] leading-[20px] text-primary mb-2"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Description{' '}
          <Text
            className="text-[14px] text-[#9ca3af]"
            style={{fontFamily: 'Poppins-Regular'}}>
            (Optional)
          </Text>
        </Text>
        <TextInput
          className="bg-white rounded-lg border border-[#d1d5db] px-4 py-3 mb-4 text-[14px] text-primary"
          style={{
            height: 100,
            fontFamily: 'Poppins-Regular',
            textAlignVertical: 'top',
          }}
          placeholder="Describe the material..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={4}
          value={description}
          onChangeText={setDescription}
        />

        {/* Material Images */}
        <Text
          className="text-[14px] leading-[20px] text-primary mb-2"
          style={{fontFamily: 'Poppins-SemiBold'}}>
          Material Images
        </Text>
        <TouchableOpacity
          className="bg-white rounded-lg border border-dashed border-[#d1d5db] items-center justify-center mb-3"
          style={{height: 140, gap: 8}}
          activeOpacity={0.7}
          disabled={uploadingImage}
          onPress={pickMaterialImage}>
          {uploadingImage ? (
            <ActivityIndicator color="#E48714" />
          ) : (
            <CloudUploadLargeIcon size={40} color="#99A1AF" />
          )}
          <Text
            className="text-[14px] leading-[20px] text-[#6a7282]"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            {uploadingImage ? 'Uploading…' : 'Tap to upload images'}
          </Text>
          <Text
            className="text-[12px] leading-[16px] text-[#9ca3af]"
            style={{fontFamily: 'Poppins-Regular'}}>
            PNG, JPG up to 10MB each
          </Text>
        </TouchableOpacity>

        {/* Selected image thumbnails */}
        {images.length > 0 && (
          <View className="flex-row flex-wrap mb-4" style={{gap: 8}}>
            {images.map((uri, idx) => (
              <View key={`${uri}-${idx}`} style={{position: 'relative'}}>
                <Image
                  source={{uri}}
                  style={{width: 72, height: 72, borderRadius: 8}}
                />
                <TouchableOpacity
                  onPress={() =>
                    setImages(prev => prev.filter((_, i) => i !== idx))
                  }
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -6,
                    backgroundColor: '#ef4444',
                    width: 20,
                    height: 20,
                    borderRadius: 10,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{color: '#fff', fontSize: 12, lineHeight: 14}}>
                    ×
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Info Note */}
        <View
          className="rounded-lg px-4 py-3 mb-4"
          style={{
            backgroundColor: '#eff6ff',
            borderLeftWidth: 4,
            borderLeftColor: '#155DFC',
          }}>
          <Text
            className="text-[12px] leading-[18px] text-[#1e3a5f]"
            style={{fontFamily: 'Poppins-Regular'}}>
            <Text style={{fontFamily: 'Poppins-SemiBold'}}>Note: </Text>
            All material information will be verified by OTG admin before
            appearing in the marketplace.
          </Text>
        </View>
      </KeyboardAwareScrollView>

      {/* Bottom Sticky Save Button */}
      <View
        className="bg-white px-4 py-3"
        style={{
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -2},
          shadowOpacity: 0.05,
          shadowRadius: 4,
          elevation: 5,
        }}>
        <TouchableOpacity
          className="bg-[#ffe403] h-12 rounded-lg flex-row items-center justify-center"
          style={{gap: 8, opacity: submitting ? 0.7 : 1}}
          activeOpacity={0.8}
          disabled={submitting}
          onPress={handleSave}>
          {submitting ? (
            <ActivityIndicator size="small" color="#404040" />
          ) : (
            <SaveCheckIcon size={20} color="#404040" />
          )}
          <Text
            className="text-[16px] leading-[24px] text-primary"
            style={{fontFamily: 'Poppins-SemiBold'}}>
            {submitting ? 'Saving...' : 'Save Material'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Nav */}
      <BottomNavBar activeTab="Inventory" />
    </View>
  );
};

export default AddNewMaterialScreen;
