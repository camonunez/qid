<template lang="pug">
	
</template>
<script setup lang="ts">
type Video = {
	id: string
	titulo: string
	url: string
	artista: string
	bpm: number
}
const videos: Video[] = [
	{
		id: 'BSz1j_y35ro',
		url: 'https://www.youtube.com/watch?v=BSz1j_y35ro',
		titulo: 'Toxibombs',
		artista: 'Trampsta & Heavy Drop',
		bpm: 143
	},
	{
		id: '0_UkQI2M1SY',
		url: 'https://www.youtube.com/watch?v=0_UkQI2M1SY',
		titulo: 'Slow Down',
		artista: 'Trampsta & Gonzi',
		bpm: 140
	},
	{
		id: 'MDUoSpDKwXk',
		url: 'https://www.youtube.com/watch?v=MDUoSpDKwXk',
		titulo: 'Giant In My Heart',
		artista: 'Kiesza',
		bpm: 123
	},
	{
		id: 'dfe-bw3TVqM',
		url: 'https://www.youtube.com/watch?v=dfe-bw3TVqM',
		titulo: 'Crazy Town',
		artista: 'Trampsta',
		bpm: 170
	},
	{
		id: 'NkRkuI0ZgX0',
		url: 'https://www.youtube.com/watch?v=NkRkuI0ZgX0',
		titulo: 'Horse',
		artista: 'Salvatore Ganacci',
		bpm: 146
	},
	{
		id: 'hVW63Z_8deE',
		url: 'https://www.youtube.com/watch?v=hVW63Z_8deE',
		titulo: 'Dorothy',
		artista: 'POLO & PAN',
		bpm: 118
	}
]
</script>
