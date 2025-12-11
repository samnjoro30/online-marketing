


export const Register = async () => {
    const { email, password } = req.body;
    
      try {
        const existingUser = users.find(u => u.email === email);
        if (existingUser) return res.status(400).json({ msg: "User already exists" });
    
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
    
        users.push({ email, password: hashedPassword });
    
        res.status(201).json({ msg: "User registered successfully" });
      } catch (err) {
        console.error(err);
        res.status(500).send("Server error");
      }
}