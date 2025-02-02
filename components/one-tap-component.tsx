'use client'
// https://supabase.com/docs/guides/auth/social-login/auth-google?queryGroups=environment&environment=client
import Script from 'next/script';
import createClientForBrowser from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const OneTapComponent = () => {
  const supabase = createClientForBrowser()
  const router = useRouter()

  // generate nonce to use for google id token sign-in
  const generateNonce = async (): Promise<string[]> => {
    const nonce = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))))
    const encoder = new TextEncoder()
    const encodedNonce = encoder.encode(nonce)
    const hashBuffer = await crypto.subtle.digest('SHA-256', encodedNonce)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashedNonce = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    return [nonce, hashedNonce]
  }

  const initializeGoogleOneTap = async () => {
    // console.log("here1")

    if (typeof window !== "undefined" && !window.google) {
      // console.log("Google script not loaded yet, waiting...")
      return
    }

    const [nonce, hashedNonce] = await generateNonce()

    const { data, error } = await supabase.auth.getSession()

    if (error) {
      console.error('Error getting session', error)
    }

    if (data.session) {
      router.push('/')
      return
    }

    // ensure google exists before calling initialize
    if (window.google && window.google.accounts) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: async (response: any) => {
          try {
            // Send ID token returned in response.credential to Supabase
            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: 'google',
              token: response.credential,
              nonce,
            })

            if (error) throw error

            // Redirect to dashboard
            router.push('/dashboard')
          } catch (error) {
            console.error('Error logging in with Google One Tap', error)
          }
        },
        nonce: hashedNonce,
        use_fedcm_for_prompt: true, // Required for Chrome's third-party cookie removal
      })

      window.google.accounts.id.prompt() // Display the One Tap UI
    } else {
      console.error("Google One Tap API not available")
    }
  }

  useEffect(() => {
    initializeGoogleOneTap()
  }, []) 

  return (
    <>
      {/* Ensure the Google script is loaded */}
      <Script 
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => initializeGoogleOneTap()} 
      />
      <div id="oneTap" className="fixed top-0 right-0 z-[100]" />
    </>
  )
}

export default OneTapComponent
