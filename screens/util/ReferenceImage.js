export const loadImages = (id_produit) => {
  switch (id_produit) {
    // Cas basés sur votre structure fournie
    case "1":
      return 'https://arena.ct.ws/product/3.jpg'; // Salade (anciennement)
    case "2":
      return 'https://arena.ct.ws/product/2.jpg'; // Carotte (anciennement)
    case "3":
      return 'https://arena.ct.ws/product/3.jpg'; // Tomate (anciennement)
    case "4":
      return 'https://arena.ct.ws/product/4.jpg'; // Poulet Léger (anciennement)
    case "8":
      return 'https://arena.ct.ws/product/8.jpg'; // Oeuf (anciennement)
    case "10":
      return 'https://arena.ct.ws/product/10.jpg'; // Gigot Agneau (anciennement)
    case "11":
      return 'https://arena.ct.ws/product/11.jpg'; // Boeuf Morceau (anciennement)
    case "12":
      return 'https://arena.ct.ws/product/12.jpg'; // Côte de Porc (anciennement)

    // Nouveaux cas basés sur les fichiers listés, en supposant une correspondance logique
    case "22": // Citron
      return 'https://arena.ct.ws/product/Citron.jpg';
    case "23": // Avocat
      return 'https://arena.ct.ws/product/Avocat.jpg';
    case "24": // Banane
      return 'https://arena.ct.ws/product/Banane.jpg';
    case "25": // Pomme
      return 'https://arena.ct.ws/product/Pomme.jpg';
    case "28": // Mangue
      return 'https://arena.ct.ws/product/Mangue.jpg';
    case "29": // Papaye
      return 'https://arena.ct.ws/product/Papaye.jpg';
    case "32": // Pomme de Terre (Patate)
      return 'https://arena.ct.ws/product/Patate.jpg';
    case "33": // Manioc
      return 'https://arena.ct.ws/product/Manioc.jpg';
    case "35": // Riz
      return 'https://arena.ct.ws/product/Riz.jpg';
    case "40": // Ail
      return 'https://arena.ct.ws/product/Ail.jpg';
    case "41": // Gingembre
      return 'https://arena.ct.ws/product/Gingembre.jpg';
    case "44": // Curcuma
      return 'https://arena.ct.ws/product/Curcuma.jpg';
    case "45": // Gros Piment Vert
      return 'https://arena.ct.ws/product/Gros Piment Vert.jpg';
    case "46": // Clou de Girofle
      return 'https://arena.ct.ws/product/Clou de Girofle.jpg';
    case "47": // Anis Étoilé
      return 'https://arena.ct.ws/product/Anis Étoilé.jpg';
    case "48": // Goyave
      return 'https://arena.ct.ws/product/Goyave.jpg';
    case "49": // Gombo
      return 'https://arena.ct.ws/product/Gombo.jpg';
    case "56": // Ananas
      return 'https://arena.ct.ws/product/Ananas.jpg';
    case "57": // Banane Plantin
      return 'https://arena.ct.ws/product/Banane Plantin.jpg';
    case "59": // Litchi
      return 'https://arena.ct.ws/product/Litchi.jpg';
    case "60": // Carambole
      return 'https://arena.ct.ws/product/Carambole.jpg';
    case "61": // Grenade
      return 'https://arena.ct.ws/product/Grenade.jpg';
    case "84": // Capitaine Poisson
      return 'https://arena.ct.ws/product/Capitaine poisson.webp';
    case "87": // Langouste
      return 'https://arena.ct.ws/product/Langouste.jpg';
    case "90": // Calamar
      return 'https://arena.ct.ws/product/Calamar.jpg';
    case "91": // Poivron
      return 'https://arena.ct.ws/product/Poivron.jpg';
    case "92": // Aubergine
      return 'https://arena.ct.ws/product/Aubergine.jpg';
    case "94": // Navet
      return 'https://arena.ct.ws/product/Navet.jpg';
    case "79": // Carpe
      return 'https://arena.ct.ws/product/Crabe.jpg'; // (Le fichier est nommé Crabe.jpg)
    case "21": // Orange
      return 'https://arena.ct.ws/product/Orange.jpg';
    case "27": // Corossol
      return 'https://arena.ct.ws/product/Corosol.jpg';

    // Cas de secours
    default:
      return 'https://arena.ct.ws/product/default.jpg';
  }
};
