<!--
SimpleLayout Component

Layout simple para onboarding y páginas especiales
- Sin navegación
- Centrado en pantalla
- Fondo limpio
- Responsive
-->

<template>
  <v-app>
    <v-main class="d-flex align-center justify-center min-h-screen bg-grey-lighten-5">
      <v-container class="pa-4">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.min-h-screen {
  min-height: 100vh;
}
</style>