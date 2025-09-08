<!--
MessageAttachment Component

Componente para mostrar archivos adjuntos en mensajes:
- Imágenes con preview y lightbox
- Videos con controles de reproducción
- Audio con waveform y controles
- Documentos con icono y nombre
- Estados de carga y error
- Botón de descarga

Props:
- attachment: Attachment - Datos del archivo adjunto
- showPreview?: boolean - Mostrar preview en línea
- size?: 'sm'|'md'|'lg' - Tamaño del preview

Emits:
- @download - Descargar archivo
- @preview - Abrir preview completo
-->

<template>
  <div class="attachment-placeholder">
    <div class="preview">📄</div>
    <div class="info">
      <div class="name">document.pdf</div>
      <div class="size">2.1 MB</div>
    </div>
    <div class="download">⬇️</div>
  </div>
</template>

<script setup lang="ts">
// TODO: Implementar attachment viewer
</script>

<style scoped>
.attachment-placeholder {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  margin: 8px 0;
}

.preview {
  font-size: 24px;
}

.info {
  flex: 1;
}

.name {
  font-weight: 500;
  margin-bottom: 2px;
}

.size {
  font-size: 12px;
  opacity: 0.7;
}

.download {
  cursor: pointer;
}
</style>