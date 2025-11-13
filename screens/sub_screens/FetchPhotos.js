// UploadPhoto.js
import React, { useState, useEffect} from 'react';
import { View, Button, Text, ActivityIndicator, Image } from 'react-native';

const UPLOAD_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co/functions/v1/upload-photo';
const GET_URL = 'https://nbgfetlejuskutvxvfmd.supabase.co/functions/v1/upload-photo';
const ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5iZ2ZldGxlanVza3V0dnh2Zm1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI5NTI3NTMsImV4cCI6MjA3ODUyODc1M30.pIj8KNWVxzBnhatG4HvqpXB36D4dPO4T8R7E-aShuEI';

export default function FetchPhotos({ target_type, target_id }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);

    try {
      // We'll request signed URLs by adding with_url=1
      const params = new URLSearchParams({
        target_type,
        target_id,
        with_url: '1',
      });

      const headers = {
        Accept: 'application/json',
      };
      if (ACCESS_TOKEN) headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;

      const res = await fetch(`${GET_URL}?${params.toString()}`, {
        method: 'GET',
        headers,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json?.error || JSON.stringify(json));
      } else {
        setPhotos(json.photos || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    UploadPhoto(ACCESS_TOKEN);
  }, [])

  return (
    <View style={{ flex: 1 }}>
      <Button title="Refresh Photos" onPress={fetchPhotos} disabled={loading} />
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ padding: 8 }}>
            {item.signed_url ? (
              <Image source={{ uri: item.signed_url }} style={{ width: 200, height: 200 }} />
            ) : (
              <Text>No URL for {item.filename}</Text>
            )}
            <Text>{item.metadata?.caption}</Text>
            <Text style={{ color: '#666' }}>{new Date(item.created_at).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
