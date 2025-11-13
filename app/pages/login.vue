<template>
  <div class="flex h-screen">
    <!-- Left Pane -->
    <div class="hidden lg:flex items-center justify-center flex-1 bg-blue-50">
      <div class="max-w-md text-center">
        <svg xmlns="http://www.w3.org/2000/svg" width="524.67004" height="531.39694" class="w-full" viewBox="0 0 524.67004 531.39694">
          <polygon points="117.67523 88.74385 113.67523 109.74385 133.61763 115.36589 131.1398 92.94604 117.67523 88.74385" fill="#60a5fa" />
          <path d="M0,523.44458c0,.66003,.53003,1.19,1.19006,1.19H523.48004c.65997,0,1.19-.52997,1.19-1.19,0-.65997-.53003-1.19-1.19-1.19H1.19006c-.66003,0-1.19006,.53003-1.19006,1.19Z" fill="#1e40af" />
          <g>
            <path d="M356.03772,238.30865H150.36885c-23.32296,0-42.22995,18.90698-42.22995,42.22995v199.43289c0,23.32291,18.90695,42.22986,42.22986,42.22986h205.66896c23.32297,0,42.22995-18.90698,42.22995-42.22995v-199.43283c0-23.32297-18.90698-42.22995-42.22995-42.22995v.00003Z" fill="#fff" />
            <path d="M356.03781,523.20093H150.36888c-23.83691,0-43.22998-19.39258-43.22998-43.22949v-199.43262c0-23.83691,19.39307-43.22998,43.22998-43.22998h205.66896c23.83691,0,43.22998,19.39307,43.22998,43.22998v199.43262c0,23.83691-19.39307,43.22949-43.22998,43.22949h-.00003ZM150.36888,239.30882c-22.73438,0-41.22998,18.49562-41.22998,41.23v199.43262c0,22.73438,18.49561,41.22949,41.22998,41.22949h205.66896c22.73438,0,41.22998-18.49512,41.22998-41.22949v-199.43262c0-22.73438-18.49561-41.22998-41.22998-41.22998H150.36888v-.00002Z" fill="#1e40af" />
            <path d="M370.93558,324.77005h-82.66788c-3.50635,0-6.35907-2.85272-6.35907-6.35907s2.85272-6.35907,6.35907-6.35907h82.66785c3.50635,0,6.35907,2.85272,6.35907,6.35907s-2.85272,6.35907-6.35907,6.35907h.00003Z" fill="#2563eb" />
            <path d="M293.3822,374.77737h-80.3571c-2.02586,0-3.67427-1.64841-3.67427-3.67429s1.64841-3.67352,3.67427-3.67352h80.3571c2.02588,0,3.67352,1.64764,3.67352,3.67352s-1.64764,3.67426-3.67352,3.67426v.00003Z" fill="#2563eb" />
            <rect x="133.61763" y="251.96666" width="46.49806" height="5.96129" rx=".31021" ry=".31021" fill="#2563eb" />
            <circle cx="334.3363" cy="253.15892" r="4.76904" fill="#1e40af" />
            <circle cx="347.45114" cy="253.15892" r="4.76904" fill="#1e40af" />
            <circle cx="360.56598" cy="253.15892" r="4.76904" fill="#1e40af" />
            <path d="M149.86826,394.44458c0,.66003,.53003,1.19,1.19006,1.19h204.28998c.65997,0,1.19-.52997,1.19-1.19,0-.65997-.53003-1.19-1.19-1.19H151.05832c-.66003,0-1.19006,.53003-1.19006,1.19Z" fill="#1e40af" />
          </g>
          <g>
            <path d="M212.17296,100.91704c4.34915-3.59367,9.72871-4.26258,12.0153-1.49438,2.28658,2.7682,.6142,7.92447-3.73698,11.51883-1.71841,1.45964-3.76141,2.48653-5.95805,2.99474l-18.6198,14.99379-6.8499-8.8877,19.08307-13.83763c.91373-2.06202,2.30807-3.87516,4.06638-5.28765h-.00002Z" fill="#60a5fa" />
            <circle cx="124.1365" cy="80.64255" r="21.99265" fill="#60a5fa" />
          </g>
        </svg>
      </div>
    </div>

    <!-- Right Pane -->
    <div class="w-full bg-white lg:w-1/2 flex items-center justify-center">
      <div class="max-w-md w-full p-6">
        <h1 class="text-3xl font-semibold mb-6 text-blue-900 text-center">Sign Up</h1>
        <h2 class="text-sm font-semibold mb-6 text-gray-500 text-center">
          Join to Our Community with all time access and free
        </h2>
        <form @submit.prevent="handleSubmit" class="space-y-4 mt-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              id="username"
              v-model="form.username"
              class="mt-1 p-2 w-full border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            />
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="mt-1 p-2 w-full border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              class="mt-1 p-2 w-full border border-gray-300 rounded-md focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-300"
            />
          </div>

          <div>
            <button
              type="submit"
              class="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 focus:outline-none focus:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transition-colors duration-300"
            >
              Sign Up
            </button>
          </div>
        </form>

        <div class="mt-4 text-sm text-gray-600 text-center">
          <p>
            Already have an account?
            <NuxtLink to="/login" class="text-blue-600 hover:underline font-medium">
              Login here
            </NuxtLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  username: '',
  email: '',
  password: ''
})

const handleSubmit = () => {
  navigateTo('/siswa')
}
</script>

<style scoped>
/* Additional custom styles if needed */
</style>