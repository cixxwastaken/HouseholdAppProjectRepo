import { Text } from 'react-native';
import { Card, Screen } from '../components/Screen';
import { supabaseConfigError } from '../lib/supabase';

export default function ConfigurationError() {
  return <Screen eyebrow="Setup required" title="Homebase needs a connection"><Card title="This build cannot reach Supabase"><Text>{supabaseConfigError ?? 'Check the app configuration and try again.'}</Text></Card></Screen>;
}
