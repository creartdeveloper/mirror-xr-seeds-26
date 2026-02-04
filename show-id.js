*{
    box-sizing: border-box;
}

.logo {
  width: auto;
  max-width: 180px;
  max-height: 80px; 
  height: auto;
  object-fit: contain;
}

.logo-wrapper{
    display:flex;
    justify-content:center;
    margin-bottom: 2rem;
}

.app-shell{
    width: 100%;
    min-height: 100svh;
    display:flex;
    justify-content:center;
    align-items:center;
}

.app-content{
    width: min(90vw, 420px);
    display:flex;
    flex-direction: column;
    align-items: center;
    padding:0 0.5 rem;
}

body{
    margin: 0;
    color:white;
    font-family: "Delius", serif;
}
