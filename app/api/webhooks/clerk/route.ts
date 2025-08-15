import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400
    })
  }

  // Get the body
  const payload = await req.json()
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || '');

  let evt: WebhookEvent

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400
    })
  }

  // Get the ID and type
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with and ID of ${id} and type of ${eventType}`)

  // Handle the webhook
  if (eventType === 'user.created') {
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
    
    if (email_addresses && email_addresses.length > 0) {
      const email = email_addresses[0].email_address;
      
      try {
        // Crear usuario en nuestra base de datos
        const { data, error } = await supabaseAdmin
          .from('usuarios')
          .insert({
            clerk_id: clerkId,
            email: email,
            nombre: first_name || '',
            apellido: last_name || '',
            avatar_url: image_url || null,
            rol: 'cliente', // Por defecto todos son clientes
            is_active: true
          })
          .select()
          .single()

        if (error) {
          console.error('Error al crear usuario:', error);
          return new Response('Error al crear usuario', { status: 500 });
        }
        
        console.log(`Usuario creado exitosamente: ${email}`);
        return new Response('Usuario creado', { status: 200 });
      } catch (error) {
        console.error('Error al crear usuario:', error);
        return new Response('Error al crear usuario', { status: 500 });
      }
    }
  }

  if (eventType === 'user.updated') {
    // Actualizar usuario en nuestra base de datos
    const { id: clerkId, email_addresses, first_name, last_name, image_url } = evt.data;
    
    if (email_addresses && email_addresses.length > 0) {
      const email = email_addresses[0].email_address;
      
      try {
        const { error } = await supabaseAdmin
          .from('usuarios')
          .update({
            email: email,
            nombre: first_name || '',
            apellido: last_name || '',
            avatar_url: image_url || null,
            updated_at: new Date().toISOString()
          })
          .eq('clerk_id', clerkId)

        if (error) {
          console.error('Error al actualizar usuario:', error);
        } else {
          console.log(`Usuario actualizado: ${email}`);
        }
      } catch (error) {
        console.error('Error al actualizar usuario:', error);
      }
    }
  }

  if (eventType === 'user.deleted') {
    // Eliminar usuario de nuestra base de datos (soft delete)
    const { id: clerkId } = evt.data;
    
    try {
      const { error } = await supabaseAdmin
        .from('usuarios')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('clerk_id', clerkId)

      if (error) {
        console.error('Error al eliminar usuario:', error);
      } else {
        console.log(`Usuario eliminado: ${clerkId}`);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
    }
  }

  return new Response('', { status: 200 })
}
