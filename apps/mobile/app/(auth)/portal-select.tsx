import { Redirect } from 'expo-router';

/** Old vertical portal list. Any leftover link lands on the 2x2 showcase. */
export default function DeprecatedPortalSelectRedirect() {
  return <Redirect href="/(auth)/portal-showcase" />;
}
