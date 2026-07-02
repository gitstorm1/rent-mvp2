import dns from 'node:dns';
if (process.env.NODE_ENV === 'development') {
    dns.setDefaultResultOrder('ipv4first');
}

import { serve } from 'inngest/next';
import { inngest } from '@/lib/inngest';
import { processBillUpload } from './functions';

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processBillUpload],
});
