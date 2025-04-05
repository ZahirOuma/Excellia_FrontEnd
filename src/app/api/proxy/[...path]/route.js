// /api/proxy/[...path]/route.js
import { NextResponse } from 'next/server';

export async function GET(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/proxy', '');
  const targetUrl = `http://localhost:8888${path}${url.search}`;
  
  const response = await fetch(targetUrl);
  const data = await response.json();
  
  return NextResponse.json(data);
}

export async function POST(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/proxy', '');
  const targetUrl = `http://localhost:8888${path}`;
  
  // Détecter le type de contenu
  const contentType = req.headers.get('content-type') || '';
  
  let requestBody;
  let requestHeaders = new Headers(req.headers);
  
  try {
    if (contentType.includes('application/json')) {
      // Pour les requêtes JSON
      requestBody = await req.json();
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      // Pour les requêtes FormData et autres
      const formData = await req.formData();
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Erreur proxy API:', error);
    return NextResponse.json(
      { message: `Erreur: ${error.message}` },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/proxy', '');
  const targetUrl = `http://localhost:8888${path}`;
  
  const response = await fetch(targetUrl, {
    method: 'DELETE',
  });
  
  // Si la réponse est vide (souvent le cas avec DELETE)
  if (response.status === 204) {
    return new NextResponse(null, { status: 204 });
  }
  
  try {
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Si pas de JSON dans la réponse, retourner un succès simple
    return NextResponse.json({ success: true });
  }
}

// Ajout de la méthode PUT également pour les mises à jour
export async function PUT(req) {
  const url = new URL(req.url);
  const path = url.pathname.replace('/api/proxy', '');
  const targetUrl = `http://localhost:8888${path}`;
  
  let response;
  
  // Vérifier le type de contenu
  const contentType = req.headers.get('Content-Type');
  
  if (contentType && contentType.includes('multipart/form-data')) {
    // Cas FormData - transférer directement le corps de la requête
    const formData = await req.formData();
    
    response = await fetch(targetUrl, {
      method: 'PUT',
      body: formData,
      // Ne pas définir Content-Type, le navigateur le fait automatiquement
    });
  } else {
    // Cas JSON
    const body = await req.json();
    
    response = await fetch(targetUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }
  
  // Récupérer et renvoyer la réponse
  const data = await response.json();
  return NextResponse.json(data);
}