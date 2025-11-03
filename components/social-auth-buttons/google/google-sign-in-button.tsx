import { supabase } from '@/lib/supabase';
import { useEffect } from 'react';
import { Platform, TouchableOpacity } from 'react-native';

import { expo } from '@/app.json';
import { Text } from '@react-navigation/elements';
import { Image } from 'expo-image';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

export default function GoogleSignInButton() {
  function extractParamsFromUrl(url: string) {
    const parsedUrl = new URL(url);
    const hash = parsedUrl.hash.substring(1); // Remove the leading '#'
    const params = new URLSearchParams(hash);

    return {
      access_token: params.get('access_token'),
      expires_in: parseInt(params.get('expires_in') || '0'),
      refresh_token: params.get('refresh_token'),
      token_type: params.get('token_type'),
      provider_token: params.get('provider_token'),
      code: params.get('code'),
    };
  }

  async function onSignInButtonPress() {
    // For Android, use package name scheme; for iOS, use custom scheme
    const redirectUri =
      Platform.OS === 'android'
        ? `${expo.android?.package || 'com.oneli.expoapp'}://`
        : `${expo.scheme}://google-auth`;

    const res = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        queryParams: { prompt: 'consent' },
        skipBrowserRedirect: true,
      },
    });

    const googleOAuthUrl = res.data.url;

    if (!googleOAuthUrl) {
      console.error('No OAuth URL found');
      return;
    }

    const result = await WebBrowser.openAuthSessionAsync(
      googleOAuthUrl,
      redirectUri,
      { showInRecents: true }
    ).catch((err) => {
      console.error('OAuth session error:', err);
    });

    if (result && result.type === 'success') {
      const params = extractParamsFromUrl(result.url);

      if (params.access_token && params.refresh_token) {
        await supabase.auth.setSession({
          access_token: params.access_token,
          refresh_token: params.refresh_token,
        });
      }
    }
  }

  // to warm up the browser
  useEffect(() => {
    WebBrowser.warmUpAsync();

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  return (
    <TouchableOpacity
      onPress={onSignInButtonPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#dbdbdb',
        borderRadius: 4,
        paddingVertical: 10,
        paddingHorizontal: 15,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // For Android shadow
      }}
      activeOpacity={0.8}
    >
      <Image
        source={{
          uri: 'https://developers.google.com/identity/images/g-logo.png',
        }}
        style={{ width: 24, height: 24, marginRight: 10 }}
      />
      <Text
        style={{
          fontSize: 16,
          color: '#757575',
          fontFamily: 'Roboto-Regular', // Assuming Roboto is available; install via expo-google-fonts or similar if needed
          fontWeight: '500',
        }}
      >
        Sign in with Google
      </Text>
    </TouchableOpacity>
  );
}
