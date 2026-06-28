import { serve } from 'inngest/next';
import { inngest } from '@/lib/innjest';
import { processBillUpload } from './functions';

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processBillUpload],
});
