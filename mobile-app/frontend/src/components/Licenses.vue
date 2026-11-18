<template>
    <div class="flex flex-col flex-1 bg-zinc-50 overflow-y-auto">
        <div class="max-w-2xl mx-auto w-full px-6 py-12">

            <!-- Back -->
            <div class="mb-8">
                <button
                    type="button"
                    @click="$emit('back')"
                    class="flex items-center gap-1.5 text-zinc-400 active:text-zinc-600 transition-colors"
                    style="-webkit-tap-highlight-color: transparent;"
                >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                    <span class="text-[13px] font-medium">Back</span>
                </button>
            </div>

            <div class="mb-10">
                <p class="text-xs font-mono text-zinc-400 uppercase tracking-widest mb-3">Legal</p>
                <h1 class="text-3xl font-semibold text-zinc-900 mb-2">Open Source Licenses</h1>
                <p class="text-sm text-zinc-500 leading-relaxed">
                    This application is built on open source software. We gratefully acknowledge
                    the work of the following authors and projects. All licenses are reproduced
                    in full as required by their respective terms.
                </p>
            </div>

            <!-- License legend -->
            <div class="flex flex-wrap gap-2 mb-8">
                <span v-for="type in licenseTypes" :key="type.name"
                    :class="['text-[11px] font-medium px-2.5 py-1 rounded-full border', type.style]">
                    {{ type.name }}
                </span>
            </div>

            <!-- Package list -->
            <div class="space-y-3">
                <div
                    v-for="pkg in packages"
                    :key="pkg.name"
                    class="bg-white rounded-xl border border-zinc-200 overflow-hidden"
                >
                    <!-- Header -->
                    <button
                        type="button"
                        @click="toggle(pkg.name)"
                        class="w-full px-5 py-4 flex items-center justify-between active:bg-zinc-50 transition-colors"
                        style="-webkit-tap-highlight-color: transparent;"
                    >
                        <div class="text-left">
                            <p class="text-[14px] font-medium text-zinc-900">{{ pkg.name }}</p>
                            <p class="text-[12px] text-zinc-400 mt-0.5">{{ pkg.copyright }}</p>
                        </div>
                        <div class="flex items-center gap-2 flex-shrink-0 ml-3">
                            <span :class="['text-[11px] font-medium px-2 py-0.5 rounded-full border', badgeStyle(pkg.license)]">
                                {{ pkg.license }}
                            </span>
                            <svg
                                class="w-4 h-4 text-zinc-400 transition-transform duration-200"
                                :class="expanded.has(pkg.name) ? 'rotate-180' : ''"
                                viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                stroke-linecap="round" stroke-linejoin="round"
                            >
                                <path d="M6 9l6 6 6-6"/>
                            </svg>
                        </div>
                    </button>

                    <!-- License text -->
                    <div
                        class="overflow-hidden transition-all duration-200"
                        :class="expanded.has(pkg.name) ? 'max-h-[9999px]' : 'max-h-0'"
                    >
                        <div class="border-t border-zinc-100 px-5 py-4">
                            <pre class="text-[11px] text-zinc-500 leading-relaxed whitespace-pre-wrap font-mono">{{ licenseText(pkg.license) }}</pre>
                        </div>
                    </div>
                </div>
            </div>

            <p class="mt-16 text-xs text-zinc-400 text-center">
                © {{ new Date().getFullYear() }} {{ appName }} · All rights reserved
            </p>

        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'

defineEmits(['back'])

const appName = 'PromotionCheck'   

const expanded = ref(new Set())
function toggle(name) {
    if (expanded.value.has(name)) {
        expanded.value.delete(name)
    } else {
        expanded.value.add(name)
    }
    expanded.value = new Set(expanded.value)
}

const licenseTypes = [
    { name: 'MIT',       style: 'bg-blue-50   text-blue-700   border-blue-200'   },
    { name: 'ISC',       style: 'bg-teal-50   text-teal-700   border-teal-200'   },
    { name: 'BSD-3',     style: 'bg-amber-50  text-amber-700  border-amber-200'  },
    { name: 'PSF-2.0',   style: 'bg-zinc-100  text-zinc-600   border-zinc-200'   },
]

function badgeStyle(license) {
    return licenseTypes.find(l => l.name === license)?.style ?? 'bg-zinc-100 text-zinc-600 border-zinc-200'
}

const packages = [
    {
        name: 'Vue',
        license: 'MIT',
        copyright: 'Copyright (c) 2013-present Yuxi (Evan) You',
    },
    {
        name: 'Vue Router',
        license: 'MIT',
        copyright: 'Copyright (c) 2019-present Eduardo San Martin Morote',
    },
    {
        name: 'Pinia',
        license: 'MIT',
        copyright: 'Copyright (c) 2019-present Eduardo San Martin Morote',
    },
    {
        name: 'Vite',
        license: 'MIT',
        copyright: 'Copyright (c) 2019-present Evan You & Vite Contributors',
    },
    {
        name: '@vitejs/plugin-vue',
        license: 'MIT',
        copyright: 'Copyright (c) 2019-present Evan You & Vite Contributors',
    },
    {
        name: 'Chart.js',
        license: 'MIT',
        copyright: 'Copyright (c) 2014-2022 Chart.js Contributors',
    },
    {
        name: 'Tailwind CSS',
        license: 'MIT',
        copyright: 'Copyright (c) Tailwind Labs, Inc.',
    },
    {
        name: 'PostCSS',
        license: 'MIT',
        copyright: 'Copyright (c) 2013 Andrey Sitnik',
    },
    {
        name: 'autoprefixer',
        license: 'MIT',
        copyright: 'Copyright (c) 2013 Andrey Sitnik',
    },
    {
        name: 'Prettier',
        license: 'MIT',
        copyright: 'Copyright (c) James Long and contributors',
    },
    {
        name: 'prettier-plugin-tailwindcss',
        license: 'MIT',
        copyright: 'Copyright (c) Tailwind Labs, Inc.',
    },
    {
        name: 'vite-plugin-static-copy',
        license: 'MIT',
        copyright: 'Copyright (c) 2021 sapphi-red',
    },
    {
        name: '@capacitor/core',
        license: 'MIT',
        copyright: 'Copyright (c) 2017-present Drifty Co.',
    },
    {
        name: '@capacitor/android',
        license: 'MIT',
        copyright: 'Copyright (c) 2017-present Drifty Co.',
    },
    {
        name: '@capacitor/cli',
        license: 'MIT',
        copyright: 'Copyright (c) 2017-present Drifty Co.',
    },
    {
        name: '@capacitor-community/sqlite',
        license: 'MIT',
        copyright: 'Copyright (c) 2020-present Jean Pierre Quéau and contributors',
    },
    {
        name: 'jeep-sqlite',
        license: 'MIT',
        copyright: 'Copyright (c) 2020-present Jean Pierre Quéau',
    },
    {
        name: 'sql.js',
        license: 'MIT',
        copyright: 'Copyright (c) 2017 sql.js authors (SQLite itself is public domain)',
    },
    {
        name: 'socket.io-client',
        license: 'MIT',
        copyright: 'Copyright (c) 2014-present Guillermo Rauch',
    },
    {
        name: 'uuid',
        license: 'MIT',
        copyright: 'Copyright (c) 2010-2020 Robert Kieffer and other contributors',
    },
    {
        name: 'simple-statistics',
        license: 'ISC',
        copyright: 'Copyright (c) 2014, Tom MacWright',
    },
    {
        name: 'Flask',
        license: 'BSD-3',
        copyright: 'Copyright (c) 2010 Pallets',
    },
    {
        name: 'Werkzeug',
        license: 'BSD-3',
        copyright: 'Copyright (c) 2007 Pallets',
    },
    {
        name: 'Flask-SQLAlchemy',
        license: 'BSD-3',
        copyright: 'Copyright (c) 2010 Pallets',
    },
    {
        name: 'SQLAlchemy',
        license: 'MIT',
        copyright: 'Copyright (c) 2005-2023 SQLAlchemy authors and contributors',
    },
    {
        name: 'Flask-CORS',
        license: 'MIT',
        copyright: 'Copyright (c) 2016 Cory Dolphin',
    },
    {
        name: 'Flask-JWT-Extended',
        license: 'MIT',
        copyright: 'Copyright (c) 2016 vimalloc',
    },
    {
        name: 'Flask-SocketIO',
        license: 'MIT',
        copyright: 'Copyright (c) 2014 Miguel Grinberg',
    },
    {
        name: 'redis-py',
        license: 'MIT',
        copyright: 'Copyright (c) 2012 Andy McCurdy',
    },
    {
        name: 'Python Standard Library (datetime, os, mimetypes, uuid)',
        license: 'PSF-2.0',
        copyright: 'Copyright (c) 2001-present Python Software Foundation',
    },
]


function licenseText(type) {
    switch (type) {
        case 'MIT': return `Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.`

        case 'ISC': return `Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR
IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.`

        case 'BSD-3': return `Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice,
   this list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its contributors
   may be used to endorse or promote products derived from this software
   without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`

        case 'PSF-2.0': return `1. This LICENSE AGREEMENT is between the Python Software Foundation ("PSF"),
   and the Individual or Organization ("Licensee") accessing and otherwise
   using this software ("Python") in source or binary form and its associated
   documentation.

2. Subject to the terms and conditions of this License Agreement, PSF hereby
   grants Licensee a nonexclusive, royalty-free, world-wide license to
   reproduce, analyze, test, perform and/or display publicly, prepare
   derivative works, distribute, and otherwise use Python alone or in any
   derivative version, provided, however, that PSF's License Agreement and
   PSF's notice of copyright are retained in Python alone or in any derivative
   version prepared by Licensee.

3. In the event Licensee prepares a derivative work that is based on or
   incorporates Python or any part thereof, and wants to make the derivative
   work available to others as provided herein, then Licensee hereby agrees
   to include in any such work a brief summary of the changes made to Python.

PYTHON IS PROVIDED "AS IS". PSF MAKES NO WARRANTIES WITH RESPECT TO PYTHON,
EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED WARRANTY OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NONINFRINGEMENT.`

        default: return ''
    }
}
</script>