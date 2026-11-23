import { updateRestaurant } from '../../api/restaurant.js';
import Card from '../../components/ui/Card.jsx';
import PhotoPicker from '../../components/ui/PhotoPicker.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useToast } from '../../hooks/useToast.js';

// Cover photo and logo for the top of the customer menu. Each one saves as soon as it is
// uploaded or removed, so there is no extra Save button to forget.
export default function BrandingCard() {
  const { restaurant, withAuth, setRestaurant } = useAuth();
  const { showToast } = useToast();

  const savePhoto = async (field, photo, message) => {
    try {
      const { restaurant: saved } = await withAuth(updateRestaurant, { [field]: photo });
      setRestaurant(saved);
      showToast(message);
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // false tells the picker the photo is still there (the error toast already explained why).
  const remove = (field, message) =>
    savePhoto(field, null, message).then(
      () => true,
      () => false,
    );

  return (
    <Card className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-h2 font-semibold">Look of your menu</h2>
        <p className="text-text-muted">Customers see these at the top of your menu.</p>
      </div>
      <PhotoPicker
        kind="cover"
        label="Cover photo"
        hint="A wide photo of your café or your best dish."
        aspect="aspect-[16/7]"
        currentUrl={restaurant.coverUrl}
        isQuiet
        onUploaded={(photo) => savePhoto('coverPhoto', photo, 'Cover photo saved')}
        onRemove={() => remove('coverPhoto', 'Cover photo removed')}
      />
      <PhotoPicker
        kind="logo"
        label="Logo"
        hint="A square logo looks best."
        shape="circle"
        currentUrl={restaurant.logoUrl}
        isQuiet
        onUploaded={(photo) => savePhoto('logo', photo, 'Logo saved')}
        onRemove={() => remove('logo', 'Logo removed')}
      />
    </Card>
  );
}
