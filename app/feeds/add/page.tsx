"use client";

import { AddFeedForm } from '@/components/podcast/add-feed-form';

export default function AddFeedPage() {
  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6 text-[#c32b1a]">Add New Podcast</h1>
      <AddFeedForm />
    </div>
  );
}
