import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Upload, CheckCircle, X } from 'lucide-react';
import { useCreateReport } from '@hooks/useReports';
import { Button, Input, Textarea, Select } from '@components/ui';
import { LOCATIONS, REPORT_TYPES, PRIORITY_LEVELS, IMMEDIATE_ACTIONS } from '@utils/constants';
import { compressImage } from '@utils/helpers';
import { reportSchema } from './validationSchema';

export const SubmitReportPage = ({ toast }) => {
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  const { mutate: createReport, isPending } = useCreateReport();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      type: '',
      location: '',
      sub_location: '',
      specific_room: '',
      incident_datetime: '',
      description: '',
      immediate_actions: [],
      actions_taken: '',
      observer_name: '',
      observer_email: '',
      priority: 'Medium',
      photos: [],
    },
  });

  const selectedLocation = watch('location');
  const selectedArea = watch('sub_location');
  const selectedActions = watch('immediate_actions') || [];

  // Pre-fill form if URL has query params (from QR code)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const building = params.get('building');
    const area = params.get('area');
    const room = params.get('room');

    if (building) setValue('location', building);
    if (area) setValue('sub_location', area);
    if (room) setValue('specific_room', room);
  }, [setValue]);

  // Update available areas when location changes
  useEffect(() => {
    if (selectedLocation && LOCATIONS[selectedLocation]) {
      const areas = Object.keys(LOCATIONS[selectedLocation]);
      setAvailableAreas(areas);
      setValue('sub_location', '');
      setValue('specific_room', '');
      setAvailableRooms([]);
    } else {
      setAvailableAreas([]);
      setAvailableRooms([]);
    }
  }, [selectedLocation, setValue]);

  // Update available rooms when area changes
  useEffect(() => {
    if (selectedLocation && selectedArea && LOCATIONS[selectedLocation]?.[selectedArea]) {
      const rooms = LOCATIONS[selectedLocation][selectedArea];
      setAvailableRooms(rooms);

      // If no specific rooms available, auto-fill with area name
      if (rooms.length === 0) {
        setValue('specific_room', selectedArea);
      } else {
        setValue('specific_room', '');
      }
    } else {
      setAvailableRooms([]);
    }
  }, [selectedLocation, selectedArea, setValue]);

  const handlePhotoCapture = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const currentPhotos = watch('photos') || [];
    if (currentPhotos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed');
      return;
    }

    try {
      const compressedPhotos = await Promise.all(
        files.map((file) => compressImage(file))
      );

      const newPhotos = [...currentPhotos, ...compressedPhotos];
      setPhotoPreviews(newPhotos);
      setValue('photos', newPhotos);
      toast.success(`${files.length} photo(s) uploaded successfully`);
    } catch (error) {
      console.error('Error processing photos:', error);
      toast.error('Failed to process photos. Please try again.');
    }
  };

  const removePhoto = (index) => {
    const currentPhotos = watch('photos') || [];
    const newPhotos = currentPhotos.filter((_, i) => i !== index);
    setPhotoPreviews(newPhotos);
    setValue('photos', newPhotos);
    toast.success('Photo removed');
  };

  const toggleAction = (actionValue) => {
    const current = selectedActions;
    const updated = current.includes(actionValue)
      ? current.filter((a) => a !== actionValue)
      : [...current, actionValue];
    setValue('immediate_actions', updated);
  };

  const onSubmit = async (data) => {
    createReport(data, {
      onSuccess: () => {
        setSubmitSuccess(true);
        toast.success('Report submitted successfully!');
        reset();
        setPhotoPreviews([]);

        // Reset success screen after 5 seconds
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 5000);
      },
      onError: (error) => {
        console.error('Error submitting report:', error);
        toast.error('Failed to submit report. Please try again.');
      },
    });
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-blue-500">
          <div className="mb-6">
            <CheckCircle className="w-20 h-20 text-blue-600 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Report Submitted!</h2>
          <p className="text-lg text-gray-600 mb-6">
            Thank you for reporting this safety concern. Your report has been received and will
            be reviewed by our safety team.
          </p>
          <Button onClick={() => setSubmitSuccess(false)}>Submit Another Report</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 border-t-4 border-blue-600">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Submit Safety Report</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Report Type */}
          <Select
            label="Report Type *"
            {...register('type')}
            options={REPORT_TYPES}
            error={errors.type?.message}
          />

          {/* Priority */}
          <Select
            label="Priority Level *"
            {...register('priority')}
            options={PRIORITY_LEVELS}
            error={errors.priority?.message}
          />

          {/* Incident Date/Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              When did this incident occur? *
            </label>
            <input
              type="datetime-local"
              {...register('incident_datetime')}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                errors.incident_datetime ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.incident_datetime && (
              <p className="text-sm text-red-600 mt-1">{errors.incident_datetime.message}</p>
            )}
          </div>

          {/* Location Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Building *"
              {...register('location')}
              options={[
                { value: '', label: 'Select Building' },
                ...Object.keys(LOCATIONS).map((loc) => ({ value: loc, label: loc })),
              ]}
              error={errors.location?.message}
            />

            <Select
              label="Area *"
              {...register('sub_location')}
              options={[
                { value: '', label: 'Select Area' },
                ...availableAreas.map((area) => ({ value: area, label: area })),
              ]}
              error={errors.sub_location?.message}
              disabled={!selectedLocation}
            />

            {availableRooms.length > 0 ? (
              <Select
                label="Specific Location *"
                {...register('specific_room')}
                options={[
                  { value: '', label: 'Select Location' },
                  ...availableRooms.map((room) => ({ value: room, label: room })),
                ]}
                error={errors.specific_room?.message}
                disabled={!selectedArea}
              />
            ) : (
              <Input
                label="Specific Location *"
                {...register('specific_room')}
                disabled={true}
                className="bg-gray-100"
              />
            )}
          </div>

          {/* Description */}
          <Textarea
            label="Description *"
            {...register('description')}
            placeholder="Describe the safety concern, incident, or observation..."
            rows={5}
            error={errors.description?.message}
          />

          {/* Immediate Actions Taken (Checkboxes) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Immediate Actions Taken
            </label>
            <div className="space-y-2">
              {IMMEDIATE_ACTIONS.map((action) => (
                <label
                  key={action.value}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedActions.includes(action.value)}
                    onChange={() => toggleAction(action.value)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{action.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Additional Actions Taken */}
          <Textarea
            label="Additional Actions / Notes (optional)"
            {...register('actions_taken')}
            placeholder="Any other actions taken or additional information..."
            rows={3}
            error={errors.actions_taken?.message}
          />

          {/* Photo Upload - Multiple Photos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo Evidence (optional, up to 5 photos)
            </label>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {photoPreviews.map((photo, index) => (
                  <div key={index} className="relative">
                    <img
                      src={photo}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg border-2 border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded">
                      Photo {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {photoPreviews.length < 5 && (
              <div className="flex gap-4">
                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                    <Camera className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Take Photo</span>
                  </div>
                </label>

                <label className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoCapture}
                    className="hidden"
                  />
                  <div className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors">
                    <Upload className="w-5 h-5 text-gray-600" />
                    <span className="text-gray-700">Upload Photos</span>
                  </div>
                </label>
              </div>
            )}
            {photoPreviews.length >= 5 && (
              <p className="text-sm text-yellow-600 mt-2">
                Maximum of 5 photos reached
              </p>
            )}
          </div>

          {/* Observer Information */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Observer Information (Optional)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Your Name"
                {...register('observer_name')}
                placeholder="Optional"
                error={errors.observer_name?.message}
              />

              <Input
                label="Your Email"
                type="email"
                {...register('observer_email')}
                placeholder="Optional"
                error={errors.observer_email?.message}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-4 pt-6">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                reset();
                setPhotoPreviews([]);
              }}
            >
              Clear Form
            </Button>
            <Button type="submit" loading={isPending} disabled={isPending}>
              {isPending ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
