"use client";
import TripGalleryLightbox from './TripGalleryLightbox';
import { StrapiMedia } from '@/lib/media';

interface Props {
  images: StrapiMedia[];
  gridClassName?: string;
  thumbClassName?: string;
}

export default function TripGalleryLightboxClient(props: Props) {
  return <TripGalleryLightbox {...props} />;
}
