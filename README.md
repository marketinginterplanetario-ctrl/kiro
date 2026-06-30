# ✨ Editor de Fotos con IA

Una aplicación web moderna para editar y mejorar fotografías usando inteligencia artificial. Perfecta para restaurar fotos antiguas, eliminar objetos no deseados, expandir imágenes y más.

## 🌐 Demo en Vivo

- **Versión React**: [https://TU-USUARIO.github.io/ai-photo-editor/](https://TU-USUARIO.github.io/ai-photo-editor/)
- **Demo HTML Simple**: Abre `demo.html` directamente en tu navegador

## 🎨 Características

### Herramientas Básicas
- **Seleccionar**: Herramienta de selección básica
- **Pincel**: Marca áreas para editar
- **Borrador**: Elimina marcas del pincel
- **Mover (Pan)**: Desplaza la vista del canvas
- **Zoom**: Acerca o aleja la imagen (también con scroll del mouse)

### Herramientas con IA 🤖

1. **Eliminar Objeto**
   - Marca el objeto que deseas eliminar con el pincel
   - La IA lo elimina y rellena el área automáticamente

2. **Expandir Imagen (Outpainting)**
   - Amplía tu imagen más allá de sus bordes originales
   - Elige la dirección: todos los lados, izquierda, derecha, arriba o abajo
   - La IA genera contenido coherente que extiende tu imagen

3. **Relleno Generativo (Inpainting)**
   - Marca un área con el pincel
   - Describe qué quieres generar en esa área
   - La IA crea el contenido según tu descripción

4. **Mejorar Calidad**
   - Mejora automáticamente la resolución y calidad
   - Perfecto para restaurar fotos antiguas o de baja calidad
   - Ajusta la intensidad del mejoramiento

5. **Editar con Texto**
   - Marca un área y describe los cambios que deseas
   - Ej: "cambiar a rojo", "agregar sombras", "hacer más brillante"
   - La IA aplica las modificaciones según tus instrucciones

## 🚀 Instalación y Uso

### Requisitos Previos
- Node.js 18 o superior
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Compilar para producción
npm run build

# Previsualizar build de producción
npm run preview
```

La aplicación estará disponible en `http://localhost:3000`

## 📖 Cómo Usar

1. **Cargar una Imagen**
   - Haz clic en "Cargar" en el panel izquierdo
   - Selecciona una imagen de tu dispositivo

2. **Navegación**
   - Usa la herramienta "Mover" o mantén presionada la rueda del mouse para desplazar la vista
   - Usa el scroll del mouse o los botones de zoom para acercar/alejar

3. **Editar con Pincel**
   - Selecciona la herramienta "Pincel"
   - Ajusta el tamaño según necesites
   - Marca las áreas que deseas editar

4. **Aplicar IA**
   - Selecciona una herramienta de IA del panel
   - Configura los parámetros en el panel derecho
   - Haz clic en "Aplicar"

5. **Historial**
   - Usa "Deshacer" para volver atrás
   - Usa "Rehacer" para avanzar
   - Se guardan hasta 20 estados

6. **Exportar**
   - Haz clic en "Exportar" para descargar tu imagen editada

## 🔧 Modo Demo vs Producción

### Modo Demo (Actual)
La aplicación actualmente funciona en **modo demo**. Las herramientas de IA están simuladas y devuelven la imagen original después de un delay de 2 segundos. Esto te permite:
- Probar toda la interfaz y flujo de trabajo
- Familiarizarte con las herramientas
- Usar las funciones básicas (zoom, pan, historial)

### Configurar IA Real

Para usar funcionalidades de IA reales, necesitas configurar un servicio de IA. Hay varias opciones:

#### Opción 1: Replicate (Recomendado para principiantes)

```typescript
// En src/utils/aiService.ts
import Replicate from 'replicate';

export class ReplicateAIService extends AIService {
  private replicate: Replicate;

  constructor(apiKey: string) {
    super(apiKey);
    this.replicate = new Replicate({ auth: apiKey });
  }

  async removeObject(imageData: string, maskData: string): Promise<string> {
    const output = await this.replicate.run(
      "stability-ai/stable-diffusion-inpainting:...",
      {
        input: {
          image: imageData,
          mask: maskData,
          prompt: "remove object",
        }
      }
    );
    return output as string;
  }
  
  // Implementar otros métodos...
}
```

**Obtener API Key:**
1. Regístrate en https://replicate.com
2. Ve a tu cuenta → API tokens
3. Copia tu token
4. Usa `new ReplicateAIService('tu-api-key')` en lugar de `new AIService()`

#### Opción 2: Stability AI

```typescript
// Para Stable Diffusion directo
const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    // parámetros según documentación
  })
});
```

#### Opción 3: Tu propio Backend

Crea un servidor que procese las imágenes y devuelva los resultados:

```typescript
async removeObject(imageData: string, maskData: string): Promise<string> {
  const response = await fetch('https://tu-backend.com/api/remove-object', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ image: imageData, mask: maskData }),
  });
  
  const result = await response.json();
  return result.processedImage;
}
```

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework UI
- **TypeScript** - Type safety
- **Vite** - Build tool ultrarrápido
- **Canvas API** - Manipulación de imágenes
- **Lucide React** - Iconos modernos
- **CSS3** - Estilos con gradientes y animaciones

## 📁 Estructura del Proyecto

```
ai-photo-editor/
├── src/
│   ├── components/
│   │   ├── ImageCanvas.tsx    # Canvas principal de edición
│   │   ├── Toolbar.tsx        # Panel de herramientas
│   │   └── AIPanel.tsx        # Panel de configuración de IA
│   ├── types/
│   │   └── index.ts           # Definiciones de tipos
│   ├── utils/
│   │   ├── aiService.ts       # Servicio de IA
│   │   └── imageUtils.ts      # Utilidades de imagen
│   ├── App.tsx                # Componente principal
│   ├── App.css                # Estilos principales
│   └── main.tsx               # Entry point
├── public/
├── index.html
├── package.json
└── README.md
```

## 🎯 Casos de Uso

- **Restauración de fotos antiguas**: Mejora fotos familiares viejas
- **Fotografía inmobiliaria**: Elimina objetos no deseados de fotos de propiedades
- **Redes sociales**: Crea contenido único expandiendo fondos
- **E-commerce**: Mejora fotos de productos
- **Arte digital**: Experimenta con generación de contenido

## 🔮 Próximas Características

- [ ] Integración real con APIs de IA
- [ ] Soporte para capas
- [ ] Más herramientas de selección (lasso, varita mágica)
- [ ] Filtros y ajustes (brillo, contraste, saturación)
- [ ] Soporte para trabajar con múltiples imágenes
- [ ] Exportar en diferentes formatos (JPEG, PNG, WebP)
- [ ] Historial persistente (guardar sesiones)
- [ ] Atajos de teclado

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 💡 Tips y Trucos

- **Rendimiento**: Para imágenes muy grandes, considera redimensionarlas antes de procesarlas con IA
- **Máscaras precisas**: Usa un tamaño de pincel pequeño para detalles finos
- **Prompts efectivos**: Sé específico en tus descripciones para mejores resultados de IA
- **Historial**: Experimenta libremente, siempre puedes deshacer
- **Zoom**: Usa zoom para trabajar en detalles pequeños

## 🐛 Solución de Problemas

### La imagen no se carga
- Verifica que el formato sea compatible (JPG, PNG, WebP)
- El tamaño máximo recomendado es 4096x4096px

### El canvas no responde
- Refresca la página
- Verifica la consola del navegador para errores

### La IA tarda mucho
- En modo demo, espera 2 segundos
- Con IA real, el tiempo depende del servicio y la complejidad

## 📞 Soporte

Si tienes preguntas o encuentras problemas:
- Abre un issue en GitHub
- Consulta la documentación de las APIs de IA que uses

---

Hecho con ❤️ y IA



## 🚀 Desplegar en GitHub Pages

### Opción 1: Despliegue Automático (Recomendado)

1. **Crea un repositorio en GitHub**
   ```bash
   # Ve a https://github.com/new y crea un repo llamado "ai-photo-editor"
   ```

2. **Sube el código**
   ```bash
   git add .
   git commit -m "Initial commit: AI Photo Editor"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/ai-photo-editor.git
   git push -u origin main
   ```

3. **Configura GitHub Pages**
   - Ve a tu repositorio en GitHub
   - Settings → Pages
   - Source: "GitHub Actions"
   - El sitio se desplegará automáticamente en cada push

4. **Accede a tu app**
   - URL: `https://TU-USUARIO.github.io/ai-photo-editor/`
   - Espera 2-3 minutos para el primer despliegue

### Opción 2: Despliegue Manual

```bash
# Construir la aplicación
npm run build

# Desplegar con gh-pages (instalar primero: npm install -g gh-pages)
npx gh-pages -d dist
```

### Actualizar el base URL

Si cambias el nombre del repositorio, actualiza `vite.config.ts`:

```typescript
export default defineConfig({
  base: '/NUEVO-NOMBRE-REPO/',
  // ...
})
```

---

## 📦 Estructura de Archivos para Despliegue

```
ai-photo-editor/
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions workflow
├── dist/                   # Build output (generado)
├── src/                    # Código fuente
├── demo.html              # Demo sin dependencias
├── vite.config.ts         # Configurado para GitHub Pages
└── package.json
```

---

## 🔧 Solución de Problemas en GitHub Pages

### La página muestra en blanco
- Verifica que `base` en `vite.config.ts` coincida con el nombre del repo
- Verifica que GitHub Pages esté configurado en "GitHub Actions"
- Revisa la pestaña "Actions" para ver si hay errores

### Los assets no cargan
- Asegúrate de que las rutas sean relativas
- Verifica que `base` esté configurado correctamente

### Error en el build
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs en la pestaña "Actions"

---
