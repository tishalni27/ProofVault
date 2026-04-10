const getFaucetStatus = async () => {
  try {
    const response = await fetch('http://139.180.140.143/faucet/');
    const data = await response.json();
    console.log(data); 
  } catch (error) {
    console.error('Error:', error);
  }
};

getFaucetStatus(); 